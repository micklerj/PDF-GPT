import { Link, useNavigate } from 'react-router-dom'; 
import { useRef, useState, useEffect, useContext } from 'react';
import AuthContext from './context/AuthProvider';
import './normal.css';
import './Login.css';
import axios from './api/axios';
const LOGIN_URL = 'http://localhost:3500/api/login';

const Login = () => {
    const { setAuth } = useContext(AuthContext);
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');

    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ username: user, password: pwd }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            console.log(JSON.stringify(response?.data));

            const accessToken = response?.data?.accessToken;
            const convos = response?.data?.convos; // Array of conversation objects, implement later
            setAuth({ user, pwd, accessToken, convos });
            setUser('');
            setPwd('');
            setSuccess(true);
            //take me home
            navigate('/');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response.status === 401) {
                setErrMsg('Invalid Username or Password');
            } else {
                setErrMsg('Failed to Login');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            {success ? (
                <section>
                    <h1>You are logged in!</h1>
                    <br />
                    <p>
                        <Link to="/">Go to Home</Link>
                    </p>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" :
                        "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1> Login </h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            ref={userRef}
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                        />
                        <button> Log In</button>
                    </form>
                    <p>
                        Need an account?<br />
                        <span className="line">
                            {/*put router link here*/}
                            <a href="Register">Register</a>
                        </span>
                    </p>
                </section>
            )}
        </>
    );
}

export default Login;