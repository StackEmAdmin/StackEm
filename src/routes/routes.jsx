import Hydrate from '../features/hydrate/Hydrate';
import Error from '../features/error/Error';
import Home from '../features/home/Home';
import SignIn from '../features/signin/SignIn';
import SignUp from '../features/signup/SignUp';
import PasswordReset from '../features/passwordreset/PasswordReset';
import Play, {
  loader as playLoader,
  action as playAction,
} from '../features/play/Play';
import Design, { loader as designLoader } from '../features/design/Design';
import Practice from '../features/practice/Practice';

/*
  SPA Structure
  / - home page (index)
  /sign-in - sign in page
  /sign-up - sign up page
  /password-reset - Reset password page

  /play - Menus (map, design, solo, practice, settings)
  /load - hydrate up

  /map/id - User created map
  /design/id - Map designer
  /verify/id - Map verification
*/

const routes = [
  {
    errorElement: <Error />,
    hydrateFallbackElement: <Hydrate />,
    children: [
      {
        path: '/',
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: 'play',
            element: <Play />,
            loader: playLoader,
            action: playAction,
          },
        ],
      },
      {
        path: '/design/:id',
        element: <Design />,
        loader: designLoader,
      },
      {
        path: '/practice',
        element: <Practice />,
      },
      {
        path: '/sign-in',
        element: <SignIn />,
      },
      {
        path: '/sign-up',
        element: <SignUp />,
      },
      {
        path: '/password-reset',
        element: <PasswordReset />,
      },
      {
        path: '/load',
        element: <Hydrate />,
      },
    ],
  },
];

export default routes;
