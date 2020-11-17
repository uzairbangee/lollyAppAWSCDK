import React from 'react'

interface Props {
    color: string
    setColor: (e) => void
}

const ColorSelector = ({color, setColor}: Props) => {
    return (
        <label htmlFor="flavourTop" className="colorPickerLabel">
            <input type="color"  value={color} className="colorPicker" name="flavourTop" id="flavourTop"
                onChange={(e)=>{
                    setColor(e.target.value)
                }}
            
            />
        </label>
    )
}

export default ColorSelector
