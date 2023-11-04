import { Fragment, useState } from 'react';
import className from 'classnames/bind';
import axios from 'axios';
import styles from './Register.module.scss';
import { Link } from 'react-router-dom';
import images from '~/assets/images/images';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = className.bind(styles);

function Register() {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // const navigate = useNavigate();

    const handleSubmit = () => {
        axios
            .post(`http://localhost:13395/api/Account/register`, {
                username,
                password,
                email,
            })
            .then((res) => {
                console.log(res);
                // if (res.status === 200) navigate('/login', {state: { from: 'register' }});
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Missing inputs') {
                    toast.warn('Vui lòng nhập đủ thông tin 😘.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light',
                    });
                }
                if (err === 'Account already exists') {
                    toast.warn('Username đã có người đăng ký 🥺.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light',
                    });
                    setUserName('');
                }
            });
    };

    return (
        <Fragment>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className={cx('modal', 'js-modal-register')}>
                <div className={cx('modal__overlay')}>
                    <img style={{ width: '100%', height: '100%' }} src={images.f8Login} alt="" />
                </div>
                <div className={cx('modal__body')}>
                    <div className={cx('auth-form ')}>
                        <div className={cx('auth-form__container', 'js-modal-container')}>
                            <div className={cx('auth-form__header')}>
                                <h3 className={cx('auth-form__heading')}>Đăng ký</h3>
                                <Link to={'/login'} className={cx('auth-form__switch-btn', 'js-login ')}>
                                    Đăng nhập
                                </Link>
                            </div>

                            <div className={cx('auth-form__form')}>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Tên đăng nhập"
                                        className={cx('auth-form__input')}
                                        id="auth-form__username"
                                        value={username}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                    <div className={cx('error')}></div>
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email của bạn"
                                        className={cx('auth-form__input')}
                                        id="auth-form__email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className={cx('error')}></div>
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Mật khẩu của bạn"
                                        className={cx('auth-form__input')}
                                        id="auth-form__password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className={cx('error')}></div>
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="password"
                                        name="passwordConfim"
                                        placeholder="Nhập lại mật khẩu"
                                        className={cx('auth-form__input')}
                                        id="auth-form__confirm-password"
                                    />
                                    <div className={cx('error')}></div>
                                </div>
                            </div>

                            <div className={cx('auth-form__aside')}>
                                <p className={cx('auth-form__policy-text')}>
                                    Bằng việc đăng ký, bạn đã đồng ý với Nest - Multipurpose eCommerce về
                                    <Link to={''} className={cx('auth-form__text-link')}>
                                        Điều khoản dịch vụ
                                    </Link>{' '}
                                    &
                                    <Link to={''} className={cx('auth-form__text-link')}>
                                        Chính sách bảo mật
                                    </Link>
                                </p>
                            </div>

                            <div className={cx('auth-form__control')}>
                                <Link
                                    to={'/'}
                                    className={cx('btn auth-form__control-back', 'btn--normal js-modal-close')}
                                >
                                    TRỞ LẠI
                                </Link>
                                <button className={cx('btn btn--primary', 'view-cart')} onClick={handleSubmit}>
                                    ĐĂNG KÝ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
export default Register;
