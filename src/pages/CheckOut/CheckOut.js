import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './CheckOut.module.scss';
import Image from '~/components/Image';
import images from '~/assets/images/images';
import { AddIcon } from '~/components/Icons';

const cx = className.bind(styles);

function CheckOut() {
    const location = useLocation();
    const data = location.state?.data;
    const [payment, setPayment] = useState('Thanh toán khi nhận hàng');
    console.log(payment)
    const navigate = useNavigate();
    const [listCart, setListCart] = useState([]);
    const [fullName, setFullName] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [city, setCity] = useState();
    const [district, setDistrict] = useState();
    const [ward, setWard] = useState();
    const [specificAddress, setSpecificAddress] = useState();

    const [recipientDetails, setRecipientDetails] = useState();
    const [priceTotal, setPriceTotal] = useState();
    const [stateAddress, setStateAddress] = useState(true);
    const [checkPushAddress, setCheckPushAddress] = useState(false);
    const [changeAddress, setchangeAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addressActive, setAddressActive] = useState();

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/checkout`, { dataId: data })
            .then((res) => {
                setListCart(res.data.products);
                setPriceTotal(res.data.price_total);
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
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
        api.get(`${process.env.REACT_APP_BASE_URL}/get-address`)
            .then((res) => {
                if (res.data.recipient_details.length > 0) {
                    setRecipientDetails(res.data.recipient_details);
                    setAddressActive(res.data.address_active);
                    setSelectedAddressId(res.data.address_active[0]._id);
                    setStateAddress(true);
                } else {
                    setStateAddress(false);
                }
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    }, [stateAddress, checkPushAddress, navigate]);

    const handlePaypal = (order_id) => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/payment`, { priceTotal, order_id, productList: listCart })
            .then((res) => {
                window.location.href = res.data;
            })
            .catch((error) => {});
    };

    const handleBuyPaypal = () => {
        const token = Cookies.get('token');
        const newListCart = listCart.map((item) => {
            var { _id, ...rest } = item;
            return rest;
        });

        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/save-order`, {
            order_items: newListCart,
            recipientDetails: addressActive,
            status: 'Chưa thanh toán',
            payment_methods: payment,
        })
            .then((res) => {
                const order_id = res.data.order_id;
                if (res.status === 200) handlePaypal(order_id);
            })
            .catch((error) => {});
    };

    const handleBuyLaterMoney = () => {
        const token = Cookies.get('token');
        const newListCart = listCart.map((item) => {
            var { _id, ...rest } = item;
            return rest;
        });

        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/save-order`, {
            order_items: newListCart,
            recipientDetails: addressActive,
            status: 'Chưa thanh toán',
            payment_methods: payment,
        })
            .then((res) => {
                if (res.status === 200) navigate('/user/purchase?type=noted');
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
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

        api.post(`${process.env.REACT_APP_BASE_URL}/update-address`, {
            full_name: fullName,
            phone_number: phoneNumber,
            specific_address: specificAddress,
            ward,
            district,
            city,
        })
            .then((res) => {
                if (res.status === 200) {
                    if (!stateAddress) setStateAddress(true);
                    if (checkPushAddress) {
                        setCheckPushAddress(false);
                        setchangeAddress(true);
                    }
                }
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    };

    const handlePushAddress = () => {
        setchangeAddress(false);
        setCheckPushAddress(true);
        setFullName('');
        setPhoneNumber('');
        setCity('');
        setDistrict('');
        setWard('');
        setSpecificAddress('');
    };

    const handleBtnGoBack = () => {
        if (stateAddress === false) navigate('/cart');
        else {
            setCheckPushAddress(false);
        }
    };

    const handleCheckboxChange = (event) => {
        setSelectedAddressId(event.target.value);
    };

    const handleActiveAddress = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/get-address-active`, {
            data_id: selectedAddressId,
        })
            .then((res) => {
                setchangeAddress(false);
                setSelectedAddressId(res.data.address_active[0]._id);
                setAddressActive(res.data.address_active);
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    };

    return (
        <div className={cx('container')}>
            <div className={cx('mt-4', 'mb-4')}>
                <div className={cx('title-page')}>
                    <h3>Thanh toán</h3>
                </div>

                <div className={cx('shipping-address-wrap')}>
                    <h4 className={cx('shipping-address-title')}>
                        <img alt="" style={{ marginRight: '10px', width: '20px' }} src={images.iconLocation} /> Địa chỉ
                        nhận hàng
                    </h4>
                    <div className={cx('shipping-address')}>
                        {addressActive && (
                            <div style={{ display: 'flex' }}>
                                <div style={{ fontWeight: '600' }}>
                                    {addressActive[0].full_name} {addressActive[0].phone_number}
                                </div>
                                <p className={cx('address')}>
                                    {addressActive[0].specific_address}, Phường/Xã {addressActive[0].ward}, Quận/Huyện{' '}
                                    {addressActive[0].district}, Tỉnh/TP {addressActive[0].city}
                                </p>
                            </div>
                        )}
                        <button
                            style={{ paddingLeft: '40px', backgroundColor: 'transparent' }}
                            onClick={() => setchangeAddress(true)}
                        >
                            Thay đổi
                        </button>
                    </div>
                </div>

                <table className={cx('table', 'mt-4')}>
                    <thead>
                        <tr>
                            <th scope="col">Sản phẩm</th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Đơn giá
                            </th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Số lượng
                            </th>
                            <th scope="col" style={{ textAlign: 'center' }}>
                                Thành tiền
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {listCart.length > 0 ? (
                            listCart.map((result) => (
                                <tr key={result._id}>
                                    <td style={{ display: 'flex', alignItems: 'center', height: '131.5px' }}>
                                        <Image style={{ width: '120px' }} src={result.img} alt="" />
                                        <p style={{ paddingLeft: '10px' }}>{result.title}</p>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        data-price={result._id}
                                        className={cx('unit-price')}
                                    >
                                        {result.price_unit}$
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <p className={cx('quantity-product-checkout')}>{result.quantity}</p>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        className={cx('product-total')}
                                        data-total={result._id}
                                    >
                                        {result.price_total}$
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
                        <p className={cx('payment-method-title')}>Phương thức thanh toán</p>
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
                                <label htmlFor="later_money">Thanh toán tiền khi nhận hàng</label>
                            </div>
                            <div className={cx('paypal')}>
                                <input type="radio" id="paypal" name="radio" value="Thanh toán bằng Paypal" onChange={handleRadio} />
                                <label htmlFor="paypal">Thanh toán tiền bằng Paypal</label>
                            </div>
                        </div>
                    </div>
                    <div className={cx('bill-product')}>
                        <div className={cx('total-payment')}>
                            Tổng thanh toán: <span className={cx('price-total-order')}>{priceTotal}$</span>
                        </div>
                        <div className={cx('buy-button')}>
                            {payment === 'Thanh toán khi nhận hàng' ? (
                                <button
                                    className={cx('btn', 'btn--primary', 'btn-sm')}
                                    onClick={handleBuyLaterMoney}
                                    style={{ marginRight: '12px' }}
                                >
                                    Đặt hàng
                                </button>
                            ) : (
                                <button
                                    className={cx('btn', 'btn--primary', 'btn-sm')}
                                    onClick={handleBuyPaypal}
                                    style={{ marginRight: '12px' }}
                                >
                                    Đặt hàng
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
                                    <h3 className={cx('auth-form__heading')}>Địa chỉ mới</h3>
                                    <p className={cx('auth-form__switch-btn')}>
                                        Để đặt hàng, vui lòng thêm địa chỉ nhận hàng.
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
                                    <button className={cx('btn', 'btn--primary', 'view-cart')} onClick={updateAddress}>
                                        Hoàn thành
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {changeAddress && (
                <div className={cx('modal')}>
                    <div className={cx('modal__overlay')}></div>
                    <div className={cx('modal__body')}>
                        <div className={cx('auth-form')}>
                            <div className={cx('auth-form__container')}>
                                <div className={cx('auth-form__header')}>
                                    <h3 className={cx('auth-form__heading')}>Địa chỉ của tôi.</h3>
                                </div>

                                <div className={cx('address-list-wrap')}>
                                    {recipientDetails &&
                                        recipientDetails.map((item) => (
                                            <div key={item._id} className={cx('address-item-wrap')}>
                                                <div className={cx('input-check-address')}>
                                                    <input
                                                        type="checkbox"
                                                        name="address-checkbox"
                                                        value={item._id}
                                                        onChange={handleCheckboxChange}
                                                        checked={selectedAddressId === item._id}
                                                    />
                                                </div>
                                                <div className={cx('address-item')}>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {item.full_name} {item.phone_number}
                                                    </div>
                                                    <p style={{ width: '80%' }}>
                                                        {item.specific_address}, {item.ward}, {item.district},{' '}
                                                        {item.city}
                                                    </p>
                                                    <p style={{ paddingLeft: '10px', width: '24%' }}>Cập nhật</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <button className={cx('btn-add-address')} onClick={handlePushAddress}>
                                    <AddIcon className={cx('icon-add-address')} />
                                    Thêm địa chỉ mới
                                </button>
                                <div className={cx('auth-form__control')}>
                                    <button
                                        onClick={() => setchangeAddress(false)}
                                        className={cx('btn auth-form__control-back', 'btn--normal')}
                                    >
                                        Trở lại
                                    </button>
                                    <button
                                        className={cx('btn', 'btn--primary', 'view-cart')}
                                        onClick={handleActiveAddress}
                                    >
                                        Hoàn thành
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
