import React from 'react';
import '@fontsource/inria-sans';
import { useNavigate } from 'react-router-dom'; // Ensure this import is present if not already

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <div className="absolute bottom-1/3 left-1/10 font-mono flex-col gap-y-3!"> {/* Adjust these values to change position */}
            <div className="text-center font-inria">
                <h1 className="text-9xl font-medium text-black mb-1">CLEARIA</h1>
                <h6 className="text-xl mb-2 text-gray-700">Har update clear, Har moment near!</h6>

            </div>
            <button onClick={() => navigate("/login")} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 hover:cursor-pointer">Login</button>
        </div>
    );
}

export default HeroSection;

