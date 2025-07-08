import { Form, redirect } from 'react-router-dom';
import { createMap } from '../../../api/map';
import './DesignMenu.css';

async function action() {
  const map = await createMap();
  return redirect(`/design/${map.id}`);
}

function DesignMenu() {
  return (
    <div className="design-container">
      <Form method="post">
        <button className="--global-button mode new">New</button>
      </Form>
    </div>
  );
}

export { DesignMenu as default, action };
