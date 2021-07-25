import { gql, useQuery } from '@apollo/client';
import { ROOT_QUERY } from './App';
import Users from './Users';

const LISTEN_FOR_USERS = gql`
  subscription {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`;

export default function UsersWrapper() {
  const { subscribeToMore, ...result } = useQuery(ROOT_QUERY);
  return (
    <Users
      {...result}
      subscribeNewUser={() =>
        subscribeToMore({
          document: LISTEN_FOR_USERS,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev;
            console.log(prev, subscriptionData);
            const newUser = subscriptionData.data.newUser;
            return Object.assign({}, prev, {
              allUsers: [newUser, ...prev.allUsers]
            });
          }
        })
      }
    />
  );
}
