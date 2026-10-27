// routes/stats.js - the numbers and the chart series used by the dashboard page.
const express = require("express");
const { getDB } = require("../db");
const { tables } = require("../tableConfig");

const router = express.Router();

// GET /api/stats
router.get("/", async function (req, res, next) {
    try {
        const db = getDB();

        const runsCount = await db.collection("runs").countDocuments();

        // The single best result in the whole sweep.
        const bestRun = await db
            .collection("runs")
            .find({})
            .sort({ mean_cer: 1 })
            .limit(1)
            .toArray();

        // The headline annotation saving. The 0.50 target is used rather than
        // 0.60 because 0.60 sits on the steepest, least-sampled part of the curve.
        const headline = await db.collection("annotation_saving").findOne({
            arm: "synthsup",
            target_cer: 0.5
        });

        // One line of the chart per training regime, points ordered by label count.
        // This is a MongoDB aggregation pipeline: sort, then group, then sort again.
        const series = await db
            .collection("runs")
            .aggregate([
                { $sort: { n: 1 } },
                {
                    $group: {
                        _id: "$arm",
                        points: { $push: { n: "$n", cer: "$mean_cer" } }
                    }
                },
                { $sort: { _id: 1 } }
            ])
            .toArray();

        res.json({
            kpis: {
                runs: runsCount,
                tables: tables.length,
                bestCer: bestRun.length > 0 ? bestRun[0].mean_cer : null,
                bestArm: bestRun.length > 0 ? bestRun[0].arm : null,
                bestN: bestRun.length > 0 ? bestRun[0].n : null,
                headlineMultiplier: headline ? headline.label_multiplier : null,
                headlineTarget: headline ? headline.target_cer : null,
                headlineLo: headline ? headline.mult_lo : null,
                headlineHi: headline ? headline.mult_hi : null,
                headlineBaselineN: headline ? headline.N_baseline : null,
                headlineArmN: headline ? headline.N_arm : null
            },
            series: series.map(function (s) {
                return { arm: s._id, points: s.points };
            })
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
