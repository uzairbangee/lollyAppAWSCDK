import React from 'react'
import ColorSelector from "./ColorSelector";

interface Props {
    color1: string
    color2: string
    color3: string
    setColor1: (e) => void
    setColor2: (e) => void
    setColor3: (e) => void
}

const LollyColorBox = ({color1, color2, color3, setColor1, setColor2, setColor3}: Props) => {
    return (
        <div className="lollyFlavourDiv">
            <ColorSelector
                color={color1}
                setColor={setColor1}
            />
            
            <ColorSelector
                color={color2}
                setColor={setColor2}
            />
            
            <ColorSelector
                color={color3}
                setColor={setColor3}
            />
        </div>
    )
}

export default LollyColorBox
