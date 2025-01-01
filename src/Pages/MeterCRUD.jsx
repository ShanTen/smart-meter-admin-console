import {useState, useEffect} from 'react'
import { toast, Slide } from 'react-toastify';
import apiBaseURL from '../api.config';
import Title from "../components/Title"
import axios from 'axios';
import { Dialog } from 'primereact/dialog';

const HandleError = err => {
    const message = err.response.message;
    console.error(message)
    toast.error(message, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide
    });
}

async function get_all_devices_from_admin(global_headers){
    const response = await axios.get(`${apiBaseURL}/admin/devices`, {headers: global_headers});
    return response.data;
}

async function get_device_from_admin_with_id(global_headers, id){
    const response = await axios.get(`${apiBaseURL}/admin/devices/${id}`, {headers: global_headers});
    return response.data;
}

async function delete_user(nodeID, global_headers){
    const response = await axios.delete(`${apiBaseURL}/admin/devices/${nodeID}`, {headers: global_headers});
    return response.data;
}

async function create_new_user(userData, global_headers){
    const response = await axios.post(`${apiBaseURL}/admin/devices`, userData, {headers: global_headers});
    return response.data;
}

function isMeterIDPresent(meterID, meters){
    for(let i = 0; i < meters.length; i++)
        if(meters[i].id == meterID) return true;
    return false;
}

function OptionsDialog({nodeID, visible, setVisible, onDelete, global_headers, _setMeterIDs, _meterIDs}){

    const handleDelete = () => {
        console.log(`Deleting node ${nodeID}`)
        onDelete(nodeID, global_headers).then(res => {
            _setMeterIDs(_meterIDs.filter(id => id !== nodeID))

            toast.success("Node successfully deleted", {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Slide
            });

            setVisible(false)
        })
        .catch(err => {
            HandleError(err)
        });
    }

    return  (<Dialog visible={visible} style={{ width: '40vw'  }} onHide={() => {if (!visible) return; setVisible(false); }}>
        <p className="m-0 bg-gray-100 p-4 justify-center flex-row gap-4 radius-2 rounded-xl">
            
            <p className="m-3 ">• Are you sure you want to delete node {nodeID}?
            <br />
            • Deleting this node is a permanent operation 
            <br />
            • Deleting this node will not result in the deletion of collected data records.</p>
            <div className="flex flex-row gap-4 justify-center">
            <button className="w-2/6 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded" onClick={()=> {setVisible(false)}}>Cancel</button>
            <button className="w-2/6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDelete()}>Delete</button>
            </div>
        </p>
    </Dialog>)
}

function AddMeterDialog({visible, setVisible, global_headers, _setMeterIDs, _meterIDs}){
    const [enabled, setEnabled] = useState(false);
    const [badDataIndicatorText, setBadDataIndicatorText] = useState(null);
    const [meterID, setMeterID] = useState('');
    const [meterName, setMeterName] = useState('');
    const [meterPassword, setMeterPassword] = useState('');

    const HandleCreate = () => {
        /* 
            let deviceID = req.body.deviceID;
            let devicePwd = req.body.password; 
            let deviceUserName = req.body.name; 
        */

        console.log(`Creating node ${meterID}`)
        create_new_user({deviceID: meterID, password: meterPassword, name: meterName}, global_headers).then(res => {
            console.log(res)
            toast.success("Node successfully created", {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Slide
            });
            _setMeterIDs(_meterIDs => [..._meterIDs, meterID])
            setVisible(false)
        })
        .catch(err => {
            HandleError(err)
        });
    }

    useEffect(() => {
        if(meterID.length === 0 || meterName.length === 0 || meterPassword.length === 0)
        {
            setEnabled(false);
            setBadDataIndicatorText("All fields are required")
            console.log(meterID, meterName, meterPassword)
        }
        else if(meterID.length < 4 || meterName.length < 4 || meterPassword.length < 4)
        {
            setEnabled(false);
            setBadDataIndicatorText("All fields must be at least 4 characters long")
        }
        else if(meterID.length > 20 || meterName.length > 20 || meterPassword.length > 20)
        {
            setEnabled(false);
            setBadDataIndicatorText("All fields must be at most 20 characters long")
        }
        else if(isNaN(parseInt(meterID)) || parseInt(meterID) < 0)
        {
            setEnabled(false);
            setBadDataIndicatorText("Meter ID must be a number and greater than 0")
        }
        else
            setEnabled(true);
    }, [meterID, meterName, meterPassword])


    return  (<Dialog visible={visible} style={{ width: '40vw'  }} onHide={() => {if (!visible) return; setVisible(false); }}>
        <div className="m-0 bg-gray-100 p-4 flex-row justify-center gap-4 radius-2 rounded-xl">
            <div className="flex flex-row gap-4 justify-center">
                <h1 className="text-2xl">Add Meter</h1>
            </div>
            <input 
                type="text" 
                placeholder="Meter ID" 
                className="rounded-xl m-2" 
                onChange={(e) => setMeterID(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="Meter Name" 
                className="rounded-xl m-2" 
                onChange={(e) => setMeterName(e.target.value)}
            />
            <input 
                type="text" 
                placeholder="Meter Password" 
                className="rounded-xl m-2" 
                onChange={(e) => setMeterPassword(e.target.value)}
            />
            
            {(!enabled) && <div className="flex flex-row gap-4 justify-center mb-2">
                <p className="text-red-600">{badDataIndicatorText}</p>
            </div>}
            

            <div className="flex flex-row gap-4 justify-center mt-2">
                <button className="w-2/6 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded" onClick={()=> {setVisible(false)}}>Cancel</button>
                <button onClick={HandleCreate} disabled={!enabled} className="w-2/6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Create</button>
            </div>
        </div>
    </Dialog>)

}

const MeterCRUDPage = () => {
    const [meterIDs, setMeterIDs] = useState([]);
    const [meters, setMeters] = useState([]);    
    const [initialFetch, setInitialFetch] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [visible, setVisible] = useState(false);
    const [visibleAdd, setVisibleAdd] = useState(false);
    const [selectedMeterId, setSelectedMeterId] = useState(null);


    const global_headers = {
        'Content-Type': 'application/json',
        'x-auth-token': token
    }

    useEffect(()=>{
        if(!initialFetch)
            return;

        get_all_devices_from_admin(global_headers).then(data => {
            if(data)
            {
                setMeterIDs(data)
                setInitialFetch(false);
            }
        }).catch(err => HandleError(err))

    },[initialFetch])

    useEffect(()=>{
        if(meterIDs.length === 0) return;
        
        for(let i=0; i<meterIDs.length; i++)
        {
            let mid = meterIDs[i]
            console.log(`mid is ${mid}`)
            get_device_from_admin_with_id(global_headers, mid)
            .then(data => {
                if(data)
                {
                    if(!isMeterIDPresent(mid, meters))
                        setMeters(meters => [...meters, {id: mid, name: data.name}])
                }
            })
            .catch(err => HandleError(err))


        }


    }, [meterIDs])


    return (<>
        <Title PageTitle={"Add or Delete Meters"}/>
        <table className="mt-8 mb-4 w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-gray-300 shadow-md md:w-3/4 lg:w-1/2">
            <thead className="bg-gray-100">
                <tr>
                        {
                        (meters.length>0) && Object.keys(meters[0]).map((cell, index) => (
                            <th key={index} className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                                {cell}
                            </th>
                        ))
                        }
                    <th className="p-4 border-b border-gray-300 text-left font-semibold text-gray-700">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                {
                    (meters.length>0) && meters.map((meter, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.values(meter).map((cell, cellIndex) => (
                                <>
                                <td key={cellIndex} className="p-4 border-b border-gray-300">
                                    {cell}
                                </td>
                                </>
                            ))
                            }
                            {
                            <td className="p-4 border-b border-gray-300">
                                <button
                                    onClick={() => {
                                        setSelectedMeterId(meter.id);
                                        setVisible(true);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                                <OptionsDialog nodeID={selectedMeterId} visible={visible} setVisible={setVisible} global_headers={global_headers} onDelete={delete_user} _setMeterIDs={setMeterIDs} _meterIDs={meterIDs} />
                            </td>
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
        <div className="flex justify-center mb-10">
            <button className="w-52 mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                setVisibleAdd(true);           
            }}>
                    Add Meter
            </button>
            <AddMeterDialog visible={visibleAdd} setVisible={setVisibleAdd} global_headers={global_headers} _setMeterIDs={setMeterIDs} _meterIDs={meterIDs} />
        </div>
    </>)

}

export default MeterCRUDPage;