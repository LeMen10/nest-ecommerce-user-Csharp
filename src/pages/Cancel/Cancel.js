import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function Cancel() {
    const navigate = useNavigate();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const order_id = urlParams.get('order_id');
    console.log(order_id);

    const updateStatusOrder = () => {
        const token = Cookies.get('token');
        const api = axios.create({
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        api.post(`${process.env.REACT_APP_BASE_URL}/delete-canceled-order`, { order_id })
            .then((res) => {
                if (res.status === 200) navigate(-2);
            })
            .catch((error) => {});
    };

    if (order_id != null) {
        updateStatusOrder();
    }
}

export default Cancel;
