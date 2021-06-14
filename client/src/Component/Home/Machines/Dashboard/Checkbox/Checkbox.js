import React from 'react'
const Checkbox = ({checkbox,setcheckbox,name,value,label}) => {
    return (
        <div>
            <input type="checkbox" id={`${name}`} name={`${name}`} value={value} onChange={() => setcheckbox({ ...checkbox, [name]: !checkbox[name]})} defaultChecked ></input>
            <label>{label}</label>
        </div>
    )
}

export default Checkbox
