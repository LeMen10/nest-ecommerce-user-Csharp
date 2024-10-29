import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './CheckOut.module.scss';
import Image from '~/components/Image';
import images from '~/assets/images/images';

const cx = className.bind(styles);

function CheckOut() {
    const location = useLocation();
    const data = location.state?.data;
    const [payment, setPayment] = useState('Thanh toán khi nhận hàng');
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    const [fullName, setFullName] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [city, setCity] = useState();
    const [district, setDistrict] = useState();
    const [ward, setWard] = useState();
    const [specificAddress, setSpecificAddress] = useState();
    const [priceTotal, setPriceTotal] = useState();
    const [stateAddress, setStateAddress] = useState(true);
    const [checkPushAddress, setCheckPushAddress] = useState(false);
    const [infoUser, setInfoUser] = useState();

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/Site/product-checkout`, data)
            .then((res) => {
                var data = res.data.result;
                var total = 0;
                
                data.map((item)=>(
                    total += item.quantity*item.price
                ))
                setProducts(data);
                setPriceTotal(total);
            })
            .catch((error) => {
                if (error.response.status === 401) navigate('/login');
                if (error.response.status === 404) navigate('/cart');
            });
    }, [data, navigate]);

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        api.get(`${process.env.REACT_APP_BASE_URL}/Site/get-address`)
            .then((res) => {
                var data = res.data.userResult;
                if (res.data.message === 'No Address') {
                    setStateAddress(false);
                } else {
                    setStateAddress(true);
                    setInfoUser(res.data.userResult);
                    setFullName(data.fullName);
                    setPhoneNumber(data.phone);
                    setCity(data.city);
                    setDistrict(data.district);
                    setWard(data.ward);
                    setSpecificAddress(data.specificAddress);
                }
            })
            .catch((error) => {
                if (error.response.status === 401) navigate('/login');
            });
    }, [stateAddress, checkPushAddress, navigate]);

    const handleBuyLaterMoney = () => {
        const token = Cookies.get('token');
        const shortList = products.map((item) => {
            var { cartId, image, price, title, userId, ...rest } = item;
            return {
                quantity: rest.quantity,
                productId: rest.productId,
                status: "Đang xử lý",
                paymentStatus: "Chưa thanh toán",
                total: rest.quantity*price,
            };
        });

        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/Site/save-order`, {
            payment,
            orderDetails: shortList
        })
            .then((res) => {
                if (res.data.message === "success") navigate('/user/purchase?type=noted');
            })
            .catch((error) => {
                if (error.response.status === 401) navigate('/login');
            });
    };

    const handleRadio = (event) => {
        setPayment(event.target.value);
    };

    const updateAddress = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/Site/update-address`, {
            phone: phoneNumber,
            specificAddress,
            ward,
            district,
            city,
            fullName,
        })
            .then((res) => {
                if (res.data.message === 'success') {
                    if (!stateAddress) setStateAddress(true);
                    if (checkPushAddress) {
                        setCheckPushAddress(false);
                    }
                }
            })
            .catch((err) => {
                if (err.response.status === 401) navigate('/login');
            });
    };

    const handleBtnGoBack = () => {
        if (stateAddress === false) navigate('/cart');
        else {
            setCheckPushAddress(false);
        }
    };

    return (
        <div className={cx('container')}>
            <div className={cx('mt-4', 'mb-4')}>
                <div className={cx('title-page')}>
                    <h3>Payment</h3>
                </div>

                <div className={cx('shipping-address-wrap')}>
                    <h4 className={cx('shipping-address-title')}>
                        <img alt="" style={{ marginRight: '10px', width: '20px' }} src={images.iconLocation} /> Shipping address
                    </h4>
                    <div className={cx('shipping-address')}>
                        {infoUser && (
                            <>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ fontWeight: '600' }}>
                                        {infoUser.fullName} {infoUser.phone}
                                    </div>
                                    <p className={cx('address')}>
                                        {infoUser.specificAddress}, Phường/Xã: {infoUser.ward}, Quận/Huyện:{' '}
                                        {infoUser.district}, Tỉnh/TP: {infoUser.city}
                                    </p>
                                </div>
                                <button
                                    style={{ paddingLeft: '40px', backgroundColor: 'transparent' }}
                                    onClick={() => setCheckPushAddress(true)}
                                >
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <table className={cx('table', 'mt-4')}>
                    <thead>
                        <tr>
                            <th scope="col">Product</th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Unit price
                            </th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Quantity
                            </th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((result) => (
                                <tr key={result.cartId}>
                                    <td style={{ display: 'flex', alignItems: 'center', height: '131.5px' }}>
                                        <Image style={{ width: '120px' }} src={result.image} alt="" />
                                        <p style={{ paddingLeft: '10px' }}>{result.title}</p>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        data-price={result.cartId}
                                        className={cx('unit-price')}
                                    >
                                        {result.price}$
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <p className={cx('quantity-product-checkout')}>{result.quantity}</p>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        className={cx('product-total')}
                                        data-total={result.cartId}
                                    >
                                        {result.price * result.quantity}$
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className={cx('text-center')}>
                                    Không có sản phẩm nào trong giỏ hàng của bạn.
                                    <Link to={'/shop'}> Mua hàng</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={cx('payment-area')}>
                    <div className={cx('payment-method')}>
                        <p className={cx('payment-method-title')}>Payment method</p>
                        <div value={payment}>
                            <div className={cx('later_money')}>
                                <input
                                    type="radio"
                                    id="later_money"
                                    name="radio"
                                    value="Thanh toán khi nhận hàng"
                                    onChange={handleRadio}
                                    checked={payment === 'Thanh toán khi nhận hàng'}
                                />
                                <label htmlFor="later_money">Cash on delivery</label>
                            </div>
                            <div className={cx('paypal')}>
                                <input
                                    type="radio"
                                    id="paypal"
                                    name="radio"
                                    value="Thanh toán bằng Paypal"
                                    onChange={handleRadio}
                                />
                                <label htmlFor="paypal">Pay with Paypal</label>
                            </div>
                        </div>
                    </div>
                    <div className={cx('bill-product')}>
                        <div className={cx('total-payment')}>
                            Total payment: <span className={cx('price-total-order')}>{priceTotal}$</span>
                        </div>
                        <div className={cx('buy-button')}>
                            {payment === 'Thanh toán khi nhận hàng' ? (
                                <button
                                    className={cx('btn', 'btn--primary', 'btn-sm')}
                                    onClick={handleBuyLaterMoney}
                                    style={{ marginRight: '12px' }}
                                >
                                    Order now
                                </button>
                            ) : (
                                <button
                                    className={cx('btn', 'btn--primary', 'btn-sm')}
                                    style={{ marginRight: '12px' }}
                                    disabled={payment === 'Thanh toán bằng Paypal'}
                                >
                                    Order now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(stateAddress === false || checkPushAddress === true) && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')}></div>
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <div className={cx('auth-form__header')}>
                                    <h3 className={cx('auth-form__heading')}>Create new address</h3>
                                    <p className={cx('auth-form__switch-btn')}>
                                        To order, please add a shipping address.
                                    </p>
                                </div>
                                <div className={cx('auth-form__form')}>
                                    <div className={cx('auth-form__group')}>
                                        <input
                                            type="text"
                                            placeholder="Họ và tên"
                                            name="fullname"
                                            className={cx('auth-form__input')}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                    <div className={cx('auth-form__group')}>
                                        <input
                                            type="text"
                                            placeholder="Số điện thoại"
                                            name="phone_number"
                                            className={cx('auth-form__input')}
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        placeholder="Tỉnh/Thành phố"
                                        name="city"
                                        className={cx('auth-form__input')}
                                        id="auth-form__user-login"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        placeholder="Quận/Huyện"
                                        name="district"
                                        className={cx('auth-form__input')}
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                    />
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        placeholder="Phường/Xã"
                                        name="ward"
                                        className={cx('auth-form__input')}
                                        value={ward}
                                        onChange={(e) => setWard(e.target.value)}
                                    />
                                </div>
                                <div className={cx('auth-form__group')}>
                                    <input
                                        type="text"
                                        placeholder="Địa chỉ cụ thể"
                                        name="specific_address"
                                        className={cx('auth-form__input')}
                                        value={specificAddress}
                                        onChange={(e) => setSpecificAddress(e.target.value)}
                                    />
                                </div>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        onClick={handleBtnGoBack}
                                        className={cx('btn auth-form__control-back', 'btn--normal')}
                                    >
                                        Trở lại
                                    </button>
                                    <button
                                        className={cx('btn', 'btn--primary', 'view-cart')}
                                        onClick={updateAddress}
                                        disabled={
                                            !specificAddress || !district || !ward || !phoneNumber || !fullName || !city
                                        }
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CheckOut;
