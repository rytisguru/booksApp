import "./CustomInput.styles.scss";

const CustomInput = ({ name, title, updateData, focus=false, value, type="text" }) => {
    return (
        <div className='form-group'>
            <label htmlFor={name}>{title}: </label>
            <input
                autoFocus={focus}
                name={name}
                id={name}
                type={type}
                value={value}
                onChange={(e) => updateData({ [e.target.name]: e.target.value })}
            />
        </div>
    )
}

export default CustomInput;