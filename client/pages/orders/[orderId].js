import { useEffect, useState } from 'react';
import { StripeCheckout } from 'react-stripe-checkout';
import seRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    }

    // immediate invocation for the first
    // second of the component rendering
    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    // returning a function at the end of useEffect
    // will invokd the function when the component is
    // unmounting. This way we can always clear the
    // timer when navigating away
    return () => { clearInterval(timerId) }
  }, [order])

  // early return because the purchase window has expired
  if (timeLeft < 0) { return <div>Order Expired</div> }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}

        // would be better to be an environment var for this
        stripeKey="pk_test_s7w9QPiCv4WtqlkZzsd4Wmoz009jmqV9SO"
        amount={order.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/orders/${orderId}`)

  return { order: data };
}

export default OrderShow;