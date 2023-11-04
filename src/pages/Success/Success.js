import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Success() {
    
    const navigate = useNavigate();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const PayerID = urlParams.get('PayerID');
    const paymentId = urlParams.get('paymentId');
    const totalOrder = urlParams.get('total');
    const order_id = urlParams.get('order_id');

    const updateStatusOrder = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/update-status-order`, { order_id })
            .then(function (res) {
                if (res.status === 200) navigate('/user/purchase?type=noted');
            })
            .catch(function (error) {});
    };

    const handleSuccess = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/success`, { PayerID, paymentId, totalOrder })
            .then((res) => {
                if (res.status === 200) updateStatusOrder();
            })
            .catch((error) => {});
    };

    if (PayerID != null && paymentId != null && totalOrder != null) {
        handleSuccess();
    }
}

export default Success;
