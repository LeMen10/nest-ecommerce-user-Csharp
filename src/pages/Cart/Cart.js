import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import className from 'classnames/bind';
import styles from './Cart.module.scss';
import Image from '~/components/Image';
import PropTypes from 'prop-types';

const cx = className.bind(styles);

function Cart({ setHeaderVariable }) {
    const navigate = useNavigate();
    const [listCart, setListCart] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [priceTotal, setPriceTotal] = useState();

    const increaseProduct = (event) => {
        const targetId = event.target.dataset.target;
        // Lấy thẻ input gần thẻ vừa ấn
        const targetElement = document.querySelector(`[data-id="${targetId}"]`);
        // Lấy value của thẻ chứa value là giá sản phẩm unit
        var priceUnit = document.querySelector(`[data-price="${targetId}"]`).innerText;
        // Thẻ chứa value là giá sản phẩm total
        var priceTotal = document.querySelector(`[data-total="${targetId}"]`);
        // Quantity + 1
        targetElement.value = Number(targetElement.value) + 1;
        // Giá total tăng lên
        var priceUnitValue = Number(priceUnit.substring(0, priceUnit.length - 1));
        var quantityValue = Number(targetElement.value);
        var priceTotalValue = priceUnitValue * quantityValue;
        priceTotal.innerText = priceTotalValue + '$';
        handleChangeQuantity(quantityValue, targetId, priceTotalValue);
    };
    const decreaseProduct = (event) => {
        const targetId = event.target.dataset.target;
        const targetElement = document.querySelector(`[data-id="${targetId}"]`);
        var priceUnit = document.querySelector(`[data-price="${targetId}"]`).innerText;
        var priceTotal = document.querySelector(`[data-total="${targetId}"]`);

        targetElement.value = Number(targetElement.value) - 1;
        var priceUnitValue = Number(priceUnit.substring(0, priceUnit.length - 1));
        var quantityValue = Number(targetElement.value);
        var priceTotalValue = priceUnitValue * quantityValue;
        priceTotal.innerText = priceTotalValue + '$';

        if (targetElement.value < 1) {
            targetElement.value = 1;
            quantityValue = 1;
            priceTotal.innerText = priceUnitValue + '$';
        } else {
            handleChangeQuantity(quantityValue, targetId, priceTotalValue);
        }
    };

    const handleChangeQuantity = (quantityValue, targetId, priceTotalValue) => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/update-quantity`, { quantityValue, targetId, priceTotalValue })
            .then(function (res) {
                setPriceTotal(res.data.price_total);
                setListCart(res.data.cart);
            })
            .catch(function (error) {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    };

    useEffect(() => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.get(`${process.env.REACT_APP_BASE_URL}/cart`)
            .then((res) => {
                setListCart(res.data.cart);
                setPriceTotal(res.data.price_total);
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    }, [navigate]);

    const deleteProductItem = (event) => {
        const token = Cookies.get('token');
        const dataId = event.target.dataset.id;
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/delete/${dataId}`)
            .then((res) => {
                if (res.status === 200) {
                    const count = res.data.count;
                    if (setHeaderVariable) setHeaderVariable(count);
                    setListCart(res.data.cart);
                    setPriceTotal(res.data.price_total);
                }
            })
            .catch((error) => {
                const err = error.response.data.message;
                if (err === 'Invalid access token') navigate('/login');
            });
    };

    const handleChange = (event) => {
        const item = event.target.value;
        const isChecked = event.target.checked;
        isChecked ? setCheckedItems([...checkedItems, item]) : setCheckedItems(checkedItems.filter((i) => i !== item));
    };

    const handleCheckAll = (event) => {
        const arrItemChecked = document.querySelectorAll(`[name="checkProductItem"]`);
        if (event.target.checked) {
            const newListCart = [];
            listCart.forEach((item) => {
                newListCart.push(item.product_id);
            });
            arrItemChecked.forEach((item) => (item.checked = true));
            setCheckedItems(newListCart);
        } else {
            arrItemChecked.forEach((item) => (item.checked = false));
            setCheckedItems([]);
        }
    };

    const handleBuy = () => {
        const data = checkedItems;
        navigate('/checkout', { state: { data } });
    };

    return (
        <div className={cx('container')}>
            <div className={cx('mt-4', 'mb-4')}>
                <div className={cx('title-page')}>
                    <h3>Giỏ hàng</h3>
                </div>

                <table className={cx('table', 'mt-4')}>
                    <thead>
                        <tr>
                            <td>
                                <div className={cx('form-check')}>
                                    <input
                                        style={{ marginBottom: '4px' }}
                                        type="checkbox"
                                        onChange={handleCheckAll}
                                        className={cx('form-check-input')}
                                        id="checkbox-all"
                                        checked={
                                            listCart && listCart.length > 0 && checkedItems.length === listCart.length
                                        }
                                    />
                                </div>
                            </td>
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
                            <th scope="col" style={{ textAlign: 'center' }} colSpan="2">
                                Chỉnh sửa
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {listCart.length > 0 ? (
                            listCart.map((result) => (
                                <tr key={result._id}>
                                    <td>
                                        <div className={cx('form-check')}>
                                            <input
                                                type="checkbox"
                                                className={cx('form-check-input', 'check-input-product')}
                                                value={result.product_id}
                                                name="checkProductItem"
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <Image style={{ width: '120px' }} src={result.img} alt="" />
                                        <p>{result.title}</p>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        data-price={result._id}
                                        className={cx('unit-price')}
                                    >
                                        {result.price_unit}$
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span
                                            className={cx('change-quantity-product')}
                                            data-target={result._id}
                                            onClick={decreaseProduct}
                                        >
                                            -
                                        </span>
                                        <input
                                            type="tel"
                                            className={cx('quantity-product')}
                                            onChange={() => {}}
                                            value={result.quantity}
                                            name="quantity"
                                            data-id={result._id}
                                            data-product_id={result.product_id}
                                        />
                                        <span
                                            className={cx('change-quantity-product')}
                                            data-target={result._id}
                                            onClick={increaseProduct}
                                        >
                                            +
                                        </span>
                                    </td>
                                    <td
                                        style={{ textAlign: 'center' }}
                                        className={cx('product-total')}
                                        data-total={result._id}
                                    >
                                        {result.price_total}$
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div
                                            onClick={deleteProductItem}
                                            className={cx('btn', 'btn-link', 'text-dark')}
                                            data-id={result._id}
                                        >
                                            Xóa
                                        </div>
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
                {listCart.length > 0 ? (
                    <div className={cx('bill-product')}>
                        <div className={cx('total-payment')}>
                            Tổng thanh toán: <span className={cx('price-total-order')}>{priceTotal}$</span>
                        </div>
                        <div className={cx('buy-button')}>
                            <button
                                className={cx('btn', 'btn--primary', 'btn-sm')}
                                onClick={handleBuy}
                                style={{ marginRight: '12px' }}
                                disabled={checkedItems.length === 0}
                            >
                                Mua hàng
                            </button>
                        </div>
                    </div>
                ) : (
                    <> </>
                )}
            </div>
        </div>
    );
}
Cart.propTypes = {
    setHeaderVariable: PropTypes.func,
};
export default Cart;
