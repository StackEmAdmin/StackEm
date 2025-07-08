import { useRouteError } from 'react-router-dom';
import Menu from '../../components/menu/Menu';
import './Error.css';

function NotFound() {
  return (
    <div className="error-container">
      <h1 className="title">404</h1>
      <p className="desc">
        In a digital world, we often stray,
        <br />
        Among the pixels, we lose our way.
        <br />
        A path once clear, now lost and bound,
        <br />
        Error 404, the page - not found.
      </p>
      <p className="error-text">
        <i>Page not found</i>
      </p>
    </div>
  );
}

function SomeError({ error }) {
  return (
    <div className="error-container">
      <h1 className="title">Oops!</h1>
      <p className="desc">
        Lost in code, lines blurred, An unexpected error occurred, A hiccup in
        the software stirred, <b>Please report to developer</b>, unperturbed.
      </p>
      <p className="error-text">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <Menu />
      {error.status === 404 ? <NotFound /> : <SomeError error={error} />}
    </>
  );
}

export default Error;
