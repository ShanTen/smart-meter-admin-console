import React, { useState, useEffect } from "react";
import Cell from "../../components/GridCellEmpty"
import Title from "../../components/Title"

const OptionsGrid = () => {
    return (
        <>
        <Title PageTitle={"Dashboard"}/>
    <div className="flex items-center justify-center mt-2 h-screen">
        <div className="grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-0 w-4/6 h-5/6 p-4">
            <Cell title={"Check Meter Logs"} redirect={"/check-meter-logs"} />
            <Cell title={"Add/delete meters"} redirect={"/meter-management"}/>
            <Cell title={"Billing"} redirect={"/billing"}/>
            <Cell title={"Check Max Demand"} redirect={"/check-max-demand"}/>
        </div>
    </div>
    </>
    )
}

export default OptionsGrid