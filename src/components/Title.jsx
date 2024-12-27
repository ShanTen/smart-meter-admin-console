import { useNavigate } from 'react-router-dom';

const Title = ({PageTitle}) => {
    const nav = useNavigate();

    const handleClick = () => {
        nav("/dashboard")
    }

    return (
        <>
        <h1 onClick={handleClick} className="select-none cursor-pointer Title text-3xl text-center hover:shadow-lg">SMART ENERGY METER - ADMIN CONSOLE</h1>
        {PageTitle && <h1 className="underline decoration-dotted text-zinc-950 font-bold text-xl h-0 mt-2 select-none text-center">{PageTitle}</h1>}
        </>
    )
}

export default Title;