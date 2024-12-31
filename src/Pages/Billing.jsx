import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { toast, Slide } from 'react-toastify';
import apiRoute from '../api.config';
import Title from "../components/Title";
import DataTable from "../components/DataTable";
import axios from 'axios';

const BillingPage = () => {
    const [startDate, setStartDate] = useState(new Date((new Date(new Date())).setMonth((new Date()).getMonth() - 2)));
    const [endDate, setEndDate] = useState(new Date());
    const [meterId, setMeterId] = useState("1001");

    const [units, setUnits] = useState(null);
    const [bill, setBill] = useState(null);
    const [billTable, setBillTable] = useState(null);

    const [badDataIndicator, setBadDataIndicator] = useState(false);
    const [badDataIndicatorMessage, setBadDataIndicatorMessage] = useState(null);
    
    const [responseData, setResponseData] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'))

    const resetState = () => {
        setUnits(null);
        setBill(null);
        setBillTable(null);
        setResponseData(null);
    }

    const GetFromAPI = async () => {
        const path = `${apiRoute}/admin/bill/${meterId}/${startDate.getTime()}/${endDate.getTime()}`
        
        const config = {
            headers : {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        }

        try{
            const data = (await axios.get(path, config)).data;
            console.log(data)
            setResponseData(data);
        }
        catch(err){
            console.error('Error fetching data:', err);
            console.log(err.response)
            resetState();
            let errorMsg = err.message || 'Failed to fetch data';

            if(err.response.status === 401){
                errorMsg = 'Session expired. Please login again';
                localStorage.removeItem('token');
            }
            else if(err.response.status === 403) errorMsg = 'Unauthorized access';
            else if(err.response.status === 404) errorMsg = 'Data not found';
            else if(err.response.status === 400) errorMsg = err.response.statusText + '. Check your inputs';
            
            
            toast.error(errorMsg, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Slide
            });
            // throw err;
        }   
    }

    useEffect(()=>{
        if(responseData === null)
            return ;
        else{
            if (responseData.units != 0) {
                setUnits(responseData.units);
                setBill(responseData.bill);
                setBillTable(responseData.billTable);
                console.table(responseData.billTable)
            }
            else{
                resetState();
                toast.error('No data to display', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    transition: Slide
                })
            }

        }
    }, [responseData])

    useEffect(() => {
        if (startDate.getTime() > endDate.getTime()) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage('Start date cannot be greater than end date');
        }
        else if (meterId.length === 0) {
            setBadDataIndicator(true);
            setBadDataIndicatorMessage('Meter ID cannot be empty');
        }
        else {
            setBadDataIndicator(false);
            setBadDataIndicatorMessage(null);
        }
    }, [startDate, endDate, meterId])

    return (<>
        <Title PageTitle={"View Bills"}/>
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
                <button disabled={badDataIndicator} className="p-2" onClick={() => GetFromAPI()}>Get Bill</button>
            </div>

            <div className="flex-row align-middle w-full">
                <div className="flex justify-center">
                    {units && <span className="p-2">Units: {units.toFixed(2)}</span>}
                </div>
                {!!bill && <div className="flex justify-center">
                    <span className="p-2">Bill: ₹{bill.toFixed(2)}</span>
                </div>}
                {billTable && <div className="flex justify-center mb-10">
                     <DataTable data={billTable} />
                </div>}
            </div>
          </div>
        </div>      

    </>)

}

export default BillingPage;