import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import 'flowbite';
import { toast, Slide } from 'react-toastify';
import apiBaseURL from '../api.config';
import Title from "../components/Title"
import axios from "axios";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceDot,
} from "recharts";

/*
    About: Sanity Check 
    - Page for Checking Max Demand of a Particular Node 
    - Should have a plot of max demand with "peak" demand highlighted
    - Inputs: Date Range, Node ID (same as check-meter-logs and billing)
    - Outputs: Max Demand(s), Peak Demand , Date of Peak Demand 
*/

function Date2Epoch(date) {
    return Date.parse(date)
}

function epoch2Date(epoch) {
    let date = (new Date(epoch))
    return date.toLocaleString("In-en")
}

function HandleError(error) {
    let msg = error.response.message;
    toast.error(msg || "An Error Occurred", {
        position: "top-right",
        autoClose: 5000,
        transition: Slide,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

async function GetMaxDemandPeakDemandData(nodeID, startEpoch, endEpoch, global_headers) {
    try {
        const response = await axios.get(`${apiBaseURL}/admin/max-demand/${nodeID}/${startEpoch}/${endEpoch}`, { headers: global_headers });
        return response.data;
    }
    catch (error) {
        console.error(error);
        HandleError(error);
        throw error;
    }
}

function MaxDemandTable({ timestamps, maxdemands }) {
    return (<table className="mb-10 rounded-lg border border-separate border-tools-table-outline  border-10 w-full max-w-4xl mx-auto overflow-hidden border-gray-300 shadow-md md:w-3/4 lg:w-1/2">
        <thead className="bg-gray-100">
            <tr>
                <th className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                    S.No
                </th>
                <th className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                    Date
                </th>
                <th className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                    Max Demand
                </th>
            </tr>
        </thead>
        <tbody>
            {
                timestamps.map((timestamp, index) => (
                    <tr key={index}>
                        <td className="p-4 border-b border-gray-300">
                            {index + 1}
                        </td>
                        <td className="p-4 border-b border-gray-300">
                            {(new Date(timestamp)).toLocaleString("In-en")}
                        </td>
                        <td className="p-4 border-b border-gray-300">
                            {maxdemands[index]}
                        </td>
                    </tr>
                ))
            }
        </tbody>
    </table>)
}

function MaxDemandPage() {

    const [startDate, setStartDate] = useState(new Date((new Date(new Date())).setMonth((new Date()).getMonth() - 2)));
    const [endDate, setEndDate] = useState(new Date());
    const [meterId, setMeterId] = useState("1001");

    const [badDataIndicator, setBadDataIndicator] = useState(false);
    const [badDataIndicatorMessage, setBadDataIndicatorMessage] = useState(null);

    const [responseData, setResponseData] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'))

    const [tableOrGraph, setTableOrGraph] = useState("table");

    const [datePowerPairs, setDatePowerPairs] = useState(null)

    const resetState = () => { };
    const GetFromAPI = async () => {
        const startEpoch = startDate.getTime();
        const endEpoch = endDate.getTime();
        const global_headers = {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }

        try {
            const data = await GetMaxDemandPeakDemandData(meterId, startEpoch, endEpoch, global_headers);
            console.log(data);
            setResponseData(data);
        }
        catch (err) {
            console.error('Error fetching data:', err);
            console.log(err.response)
            resetState();
            let errorMsg = err.message || 'Failed to fetch data';

            if (err.response.status === 401) {
                errorMsg = 'Session expired. Please login again';
                localStorage.removeItem('token');
            }
            else if (err.response.status === 403) errorMsg = 'Unauthorized access';
            else if (err.response.status === 404) errorMsg = 'Data not found';
            else if (err.response.status === 400) errorMsg = err.response.statusText + '. Check your inputs';

            setBadDataIndicator(true);
            setBadDataIndicatorMessage(errorMsg);
        }
    };

    useEffect(() => {
        if (!responseData)
            return

        console.log("Ooga booga")
        console.log(responseData["billing-cycle-max-demand"])

        const dmd = responseData["daily-max-demand"];
        const ts = responseData["daily-max-demand-timestamps"];
        const pairs = []
        for (let i = 0; i < dmd.length; i++) {
            pairs.push({ time: epoch2Date(ts[i]), power: dmd[i] })
        }
        setDatePowerPairs(pairs);
    }, [responseData]);

    useEffect(() => {

        if (startDate > endDate) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("Start date cannot be after end date");
        }
        else if (startDate > new Date()) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("Start date cannot be in the future");
        }
        else if (endDate > new Date()) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("End date cannot be in the future");
        }

        else if (meterId === "") {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("Meter ID cannot be empty");
        }

        else if (meterId.length > 10) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("Meter ID cannot be more than 10 characters");
        }

        else if (meterId.length < 4) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage("Meter ID cannot be less than 4 characters");
        }
        else
            setBadDataIndicator(false);
    }, [startDate, endDate, meterId]);

    return (<div>
        <Title PageTitle={"Check Max Demand"} />
        <div className="flex flex-col">
            <div className="bill-form flex flex-col mt-12 md:flex-row md:mx-72 space-x-2">

                <div className="flex-auto">
                    <input
                        type="text"
                        placeholder="Meter ID"
                        className="rounded-xl"
                        value={meterId}
                        onChange={(e) => setMeterId(e.target.value)}
                    />
                </div>
                <div className="flex-initial">
                    <DatePicker
                        selected={startDate}
                        className="text-center rounded-xl"
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                    />
                </div>
                <div className="flex-auto">
                    <DatePicker
                        selected={endDate}
                        className="text-center rounded-xl"
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                    />
                </div>
            </div>
        </div>

        {badDataIndicator && <div className="text-red-600 flex flex-col mt-3 md:flex-row space-x-2 justify-center">{badDataIndicatorMessage}</div>}

        <div className="bill-form flex flex-col mt-3 md:flex-row md:mx-72 space-x-2">
            <div className="flex-row align-middle w-full">
                <div className="align-middle flex justify-center">
                    <button disabled={badDataIndicator} className="p-2" onClick={() => GetFromAPI()}>Get Max Demand </button>
                    <button disabled={badDataIndicator} className="p-2" onClick={() => {
                        (tableOrGraph === 'table') ? setTableOrGraph('graph') : setTableOrGraph('table')
                    }}>Show {tableOrGraph}</button>
                </div>
            </div>
        </div>

        <div>
            {responseData && responseData["billing-cycle-max-demand"] && <div className="flex flex-col mt-12 md:flex-row md:mx-72 space-x-2 justify-center">
                <div className="flex-auto">
                    <h1 className="text-center font-normal text-l">Peak Demand: {responseData["billing-cycle-max-demand"]} Watts</h1>
                </div>
                <div className="flex-auto">
                    <h1 className="text-center font-normal text-l">Date of Peak Demand: {epoch2Date(parseInt(responseData["billing-cycle-max-demand-timestamp"]))}</h1>
                </div>
            </div>
            }        </div>

        {(tableOrGraph === 'graph' && responseData) && <div className="flex flex-col mt-12 md:flex-row md:mx-72 space-x-2 justify-center">
            <MaxDemandTable
                timestamps={responseData["daily-max-demand-timestamps"]}
                maxdemands={responseData["daily-max-demand"]}
            />
        </div>}

        {(tableOrGraph === 'table' && responseData) && <div className="flex flex-col mt-12 md:flex-row md:mx-72 space-x-2 justify-center">
            <LineChart
                width={1000}
                height={300}
                XAxis="Time"
                YAxis="Power"

                data={datePowerPairs}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
                <Line type="monotone" dataKey={"power"} stroke="#8884d8" />
                <ReferenceDot
                    x={epoch2Date(responseData["peak-demand-timestamp"])}
                    y={responseData["peak-demand"]}
                    r={30}
                    fill="red"
                    ifOverflow="visible"
                    stroke="none"
                />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
            </LineChart>
        </div>}
    </div>)
}

export default MaxDemandPage;