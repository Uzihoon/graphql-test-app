import AuthorizedUser from './AuthorizedUser';
import { gql } from '@apollo/client';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import UsersWrapper from './UsersWrapper';
import PostPhoto from './PostPhoto';

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers {
      ...userInfo
    }
    me {
      ...userInfo
    }
    allPhotos {
      id
      name
      url
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`;

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path='/'
          component={() => (
            <>
              <AuthorizedUser />
              <UsersWrapper />
            </>
          )}
        />
        <Route path='/newPhoto' component={PostPhoto} />
        <Route path='/' />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
