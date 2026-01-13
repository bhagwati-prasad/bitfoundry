// Every node can optionally have a 'subGraph' property containing { nodes: [], links: [] }
const ecosystemData = {
    id: "root",
    label: "Ecosystem",
    nodes: [
        {
            id: "bbpcu", label: "BBPCU", group: "central", r: 40, desc: "<strong>Central Unit (NBBL)</strong>. The Hub.<br>Click to drill down into Switch Architecture.",
            subGraph: {
                id: "bbpcu_internal",
                label: "BBPCU Internal",
                nodes: [
                    { id: "switch", label: "Core Switch", group: "central", r: 35, desc: "Transaction Switching Engine." },
                    { id: "router", label: "Router", group: "internal", r: 25, desc: "Routes based on Biller ID." },
                    { id: "risk", label: "Risk Engine", group: "internal", r: 25, desc: "Fraud checks & velocity limits." },
                    {
                        id: "clearing", label: "Clearing Sys", group: "internal", r: 30, desc: "Net Settlement Calculation.<br>Click for Deep Dive.",
                        // Level 3 Drill Down
                        subGraph: {
                            id: "clearing_deep",
                            label: "Clearing Logic",
                            nodes: [
                                { id: "net_calc", label: "Net Calc", group: "internal", r: 25, desc: "Calculates Pay-in/Pay-out." },
                                { id: "collateral", label: "Collateral", group: "internal", r: 25, desc: "Checks bank guarantees." },
                                { id: "file_gen", label: "File Gen", group: "end", r: 20, desc: "Generates settlement files for RTGS (Real Time Gross Settlement)." }
                            ],
                            links: [
                                { source: "net_calc", target: "collateral", type: "internal", label: "Check" },
                                { source: "net_calc", target: "file_gen", type: "internal", label: "Export" }
                            ]
                        }
                    }
                ],
                links: [
                    { source: "switch", target: "router", type: "internal", label: "Lookup" },
                    { source: "switch", target: "risk", type: "internal", label: "Validate" },
                    { source: "switch", target: "clearing", type: "internal", label: "Log" }
                ]
            }
        },
        {
            id: "cou", label: "COU", group: "ou", r: 30, desc: "<strong>Customer Operating Unit</strong>. Bank/App.<br>Click for Internal Architecture.",
            subGraph: {
                id: "cou_internal",
                label: "COU Internal",
                nodes: [
                    { id: "cou_app", label: "App UI", group: "end", r: 25, desc: "Mobile/Web Interface." },
                    { id: "cou_gw", label: "API Gateway", group: "ou", r: 30, desc: "Security & Rate Limiting." },
                    { id: "cou_cbs", label: "Core Banking", group: "internal", r: 25, desc: "Ledger system." }
                ],
                links: [
                    { source: "cou_app", target: "cou_gw", type: "flow", label: "HTTPS" },
                    { source: "cou_gw", target: "cou_cbs", type: "internal", label: "Debit" }
                ]
            }
        },
        {
            id: "bou", label: "BOU", group: "ou", r: 30, desc: "<strong>Biller Operating Unit</strong>. Connects Billers.<br>Click for Internal Architecture.",
            subGraph: {
                id: "bou_internal",
                label: "BOU Internal",
                nodes: [
                    { id: "bou_adapter", label: "Biller Adapter", group: "ou", r: 30, desc: "Format translation." },
                    { id: "bou_recon", label: "Recon Engine", group: "internal", r: 25, desc: "Matches transactions." },
                    { id: "ext_utility", label: "Utility API", group: "end", r: 25, desc: "External Biller System." }
                ],
                links: [
                    { source: "bou_adapter", target: "ext_utility", type: "flow", label: "Fetch" },
                    { source: "bou_adapter", target: "bou_recon", type: "internal", label: "Log" }
                ]
            }
        },
        { id: "dms", label: "DMS", group: "support", r: 25, desc: "Dispute Management System." },
        { id: "sgf", label: "SGF", group: "support", r: 25, desc: "Settlement Guarantee Fund." },
        { id: "agent", label: "Agent", group: "end", r: 25, desc: "Physical or Digital touchpoint." },
        { id: "customer", label: "Customer", group: "end", r: 20, desc: "End User." },
        { id: "biller", label: "Biller", group: "end", r: 25, desc: "The Utility Company." }
    ],
    links: [
        { source: "customer", target: "agent", type: "flow", label: "1. Init" },
        { source: "agent", target: "cou", type: "flow", label: "2. Req" },
        { source: "cou", target: "bbpcu", type: "flow", label: "3. Route" },
        { source: "bbpcu", target: "bou", type: "flow", label: "4. Switch" },
        { source: "bou", target: "biller", type: "flow", label: "5. Fetch" },
        { source: "biller", target: "bou", type: "flow", label: "6. Data" },
        { source: "bou", target: "bbpcu", type: "flow", label: "7. Resp" },
        { source: "bbpcu", target: "cou", type: "flow", label: "8. Resp" },
        { source: "cou", target: "agent", type: "flow", label: "9. Show" },
        { source: "bbpcu", target: "dms", type: "admin", label: "Disputes" },
        { source: "bbpcu", target: "sgf", type: "admin", label: "Risk" }
    ]
};