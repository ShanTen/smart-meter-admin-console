import { useNavigate } from 'react-router-dom';
import { useState } from 'react'


const GridItemEmpty = ({ title, redirect }) => {
    const navigate = useNavigate();
    const [redirURL, setRedirURL] = useState(redirect)

    if(!redirURL) {
        setRedirURL("/dashboard")
    }

    const onPress = () => {
        navigate(redirURL);
    }

    return (
        <div className="border-2 border-dotted border-gray-400 flex items-center justify-center h-60 rounded-xl bg-slate-500 hover:bg-sky-700 cursor-pointer" onClick={onPress}>
            <span className="text-lg font-semibold text-zinc-50 select-none" >
                {title}
            </span>
        </div>
    )
}

export default GridItemEmpty;