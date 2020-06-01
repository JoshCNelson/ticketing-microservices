import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {

  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    )
  });

  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  );
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };

  // SAVING THIS FOR REFERENCE EVEN THOUGH IT IS REPLACED BY BUILD-CLIENT
  // if (typeof window === 'undefined') {
  //   // This is how we know we are on the server
  //   // Requests should be made in the format of:
  //   // http://SERVICENAME.NAMESPACE.svc.cluster.local/ROUTE/YOU/WANT/TO/MATCH/TO
  //   // this sends the request to ingress-nginx which will then know
  //   // what service to route the request to
  //   const { data } = await axios.get(
  //     'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
  //     // We need to include the domain host so that ingress-nginx knows
  //     // what domain to match against. The browser knows and includes this automatically
  //     // but the server does not
  //     {
  //       headers: req.headers
  //     }
  //   )

  //   return data;
  // } else {
  //   // We are in the browser.
  //   // We can make a request and the browser will prepend the domain for us
  //   const { data } = await axios.get('/api/users/currentuser');
  //   return data;
  // }

}

export default LandingPage;