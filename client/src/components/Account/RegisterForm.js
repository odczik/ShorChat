import React from "react"
import ReCAPTCHA from "react-google-recaptcha"

const RegisterForm = ({ setUsername, setEmail, setPass, Register, setRecaptchaToken, avatar, setAvatar, ToS, setToS }) => {

    const recaptchaChange = (e) => {
        setRecaptchaToken(e)
    }

    const uploadAvatar = (e) => {
        let files = e.target.files
        let reader = new FileReader()
        reader.readAsDataURL(files[0])

        reader.onload = (e) => {
            setAvatar({name: files[0].name, avatar: e.target.result})
        }
    }

    return (
        <div className="container mt-6 mb-6">
            <div className="box">
                <h1 className="title is-1">Register</h1>
                <div className="field">
                    <div className={`file is-info is-fullwidth ${avatar ? "has-name": ""}`}>
                        <label className="file-label">
                            <input className="file-input" type="file" name="resume" accept=".png,.jpg,.jpeg" onChange={e => uploadAvatar(e)} disabled />
                            <span className="file-cta">
                                <span className="file-icon">
                                    <i className="fas fa-upload"></i>
                                </span>
                                <span className="file-label">
                                    Avatar
                                </span>
                            </span>
                            {avatar ? (
                                <span className="file-name">
                                    {avatar.name}
                                </span>
                            ): null}
                        </label>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Username</label>
                    <div className="control has-icons-left">
                        <input onChange={e => setUsername( e.target.value )} type="text" placeholder="Username" className="input" required />
                        <span className="icon is-small is-left">
                            <i className="fas fa-user"></i>
                        </span>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Email</label>
                    <div className="control has-icons-left">
                        <input onChange={e => setEmail( e.target.value )} type="email" placeholder="Email" className="input" required />
                        <span className="icon is-small is-left">
                            <i className="fas fa-envelope"></i>
                        </span>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Password</label>
                    <div className="control has-icons-left">
                        <input onChange={e => setPass( e.target.value )} type="password" placeholder="Password" className="input" />
                        <span className="icon is-small is-left">
                            <i className="fas fa-lock"></i>
                        </span>
                    </div>
                </div>
                <div className="field">
                    <label className="checkbox">
                        <input onChange={e => setToS(!e.target.checked)} type="checkbox" />
                        &nbsp; I accept <a href="/ToS">Terms of Use</a>
                    </label>
                </div>
                <ReCAPTCHA
                    sitekey=""
                    //sitekey=""
                    onChange={recaptchaChange}
                    className="mb-1"
                />
                <button onClick={Register} className="button is-success" disabled={ToS}>Register</button>
            </div>
        </div>
    )
}

export default RegisterForm