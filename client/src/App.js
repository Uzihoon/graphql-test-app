import AuthorizedUser from './AuthorizedUser';
import { gql } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import UsersWrapper from './UsersWrapper';

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
      <div>
        <AuthorizedUser />
        <UsersWrapper />
      </div>
    </BrowserRouter>
  );
}

export default App;
