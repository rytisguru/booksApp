import "./CustomInput.styles.scss";

const CustomInput = ({ name, title, updateData, focus=false, value, type="text", dataList=null }) => {
    return (
        <div className='form-group'>
            <label htmlFor={name}>{title}: </label>
            <input
                autoFocus={focus}
                name={name}
                id={name}
                type={type}
                value={value}
                list={dataList}
                autoComplete="off"
                onChange={(e) => updateData({ [e.target.name]: e.target.value })}
            />
        </div>
    )
}

export default CustomInput;