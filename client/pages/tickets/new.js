import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import { Router } from 'next/router';

const newTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => Router.push('/')
  })

  const onSubmit = (e) => {
    e.preventDefault();

    doRequest();
  }

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) { return; }

    setPrice(value.toFixed(2));
  }

  return (
    <div>
      <h1>create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            onBlur={onBlur}
            value={title}
            className="form-control"
            onChange={(e) => { setTitle(e.target.value) }}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            onBlur={onBlur}
            value={price}
            className="form-control"
            onChange={(e) => { setPrice(e.target.value) }}
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default newTicket;