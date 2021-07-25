import { useMutation } from '@apollo/client';
import { Button, Input, Select } from 'antd';
import Form from 'antd/lib/form/Form';
import TextArea from 'antd/lib/input/TextArea';
import gql from 'graphql-tag';
import { useState } from 'react';
import { useHistory } from 'react-router';

const typeList = ['PORTRAIT', 'LANDSCAPE', 'ACTION', 'GRAPHIC'];

const POST_PHOTO_MUTATION = gql`
  mutation postPhoto($input: PostPhotoInput!) {
    postPhoto(input: $input) {
      id
      name
    }
  }
`;

const initialPhoto = {
  name: '',
  description: '',
  category: typeList[0],
  file: ''
};

export default function PostPhoto() {
  const [uploadPhoto] = useMutation(POST_PHOTO_MUTATION);
  const [photo, setPhoto] = useState(initialPhoto);
  const history = useHistory();

  const onSetPhoto = ({ target: { value, name } }) => {
    setPhoto({ ...photo, [name]: value });
  };

  const handleSubmit = async () => {
    console.log(uploadPhoto);
    await uploadPhoto({ variables: { input: { ...photo } } });
    history.push('/');
  };

  const handleBack = () => {
    history.goBack();
  };

  return (
    <Form>
      <Input
        type='text'
        style={{ margin: '10px' }}
        placeholder='Photo name...'
        value={photo.name}
        name='name'
        onChange={onSetPhoto}
      />
      <TextArea
        style={{ margin: '10px' }}
        placeholder='Photo Description....'
        value={photo.description}
        onChange={onSetPhoto}
        name='description'
      />
      <Select
        value={photo.category}
        style={{ margin: '10px' }}
        name='category'
        onChange={value => onSetPhoto({ target: { value, name: 'category' } })}
      >
        {typeList.map(type => (
          <Select.Option key={type} value={type}>
            {type}
          </Select.Option>
        ))}
      </Select>
      <Input
        type='file'
        accept='image/jpeg'
        style={{ margin: '10px' }}
        name='file'
        onChange={({ target }) =>
          onSetPhoto({ target: { value: target.files[0], name: 'file' } })
        }
      />
      <div style={{ margin: '10px' }}>
        <Button type='primary' onClick={handleSubmit}>
          Post Photo
        </Button>
        <Button onClick={handleBack} style={{ marginLeft: '5px' }}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}
