/* eslint-disable react/jsx-props-no-spreading */
import { MaskedInput as Input } from 'antd-mask-input';
import type { MaskedInputProps } from 'antd-mask-input/build/main/lib/MaskedInput';
import { Form } from 'antd';

const MaskedInput = (props: MaskedInputProps) => {
  const { status } = Form.Item.useStatus();

  return (
    <Input
      status={status === 'error' ? 'error' : ''}
      maskOptions={{
        placeholderChar: '  ',
        lazy: true,
      }}
      {...props}
    />
  );
};

export default MaskedInput;
