import { useEffect, useMemo } from 'react'
import { Col, ColProps, Form, FormProps, Input, Row } from 'antd'
import { FormInstance, Rule } from 'antd/es/form'
import styles from './index.less'

export type HandleFormItemType<K> = {
  name: K
  label?: string
  extra?: string
  rules?: Rule[]
  hidden?: boolean
  children?: React.ReactNode
  addonAfter?: React.ReactNode
  addonBefore?: React.ReactNode
  placeholder?: string
  delete?: (form: FormInstance) => boolean
}

export type HandleFormProps<
  T extends Record<string, any>,
  K extends string
> = FormProps & {
  actionType?: 'add' | 'edit' | 'preview'
  values?: T
  items?: HandleFormItemType<keyof T>[]
  dictionary: Record<K, string>
  form: FormInstance<T>
  span?: ColProps['span']
}

export default function HandleForm<
  T extends Record<string, any>,
  K extends string
>({
  actionType = 'add',
  values,
  items,
  dictionary,
  form,
  span = 24,
  className,
  ...formProps
}: HandleFormProps<T, K>) {
  useEffect(() => {
    if (actionType === 'add') {
      return
    }

    form.setFieldsValue({
      ...values,
    })
    return () => {
      form.resetFields()
    }
  }, [actionType, values])

  const formItems = useMemo(() => {
    return items?.map(({ name, addonAfter, addonBefore, placeholder, ...item }) => ({
      name,
      label: dictionary[name as K],
      children: (
        <Input
          key={String(name)}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          placeholder={placeholder || `请输入${dictionary[name as K]}`}
        />
      ),
      ...item,
    })) as HandleFormItemType<K>[]
  }, [items])

  const defaultProps = useMemo(
    () => ({
      labelCol: {
        span: 7,
      },
      wrapperCol: {
        span: 17,
      },
    }),
    []
  )

  return (
    <Form
      layout="horizontal"
      className={`${className || ''} ${
        formProps.layout === 'inline' ? styles.inlineForm : ''
      }`}
      autoComplete="off"
      labelCol={formProps.labelCol || defaultProps.labelCol}
      wrapperCol={formProps.wrapperCol || defaultProps.wrapperCol}
      form={form}
      disabled={actionType === 'preview'}
      validateMessages={{
        default: undefined,
        required: `\${label}不能为空`,
      }}
      {...formProps}
    >
      <Row gutter={24}>
        {formItems
          .map((item) => {
            const {delete: deleteFn, ...itemProps} = item;
            
            return deleteFn?.(form) ? null : (
              <Col
                span={span}
                key={String(item.name)}
                className={item.hidden ? styles.displayNone : ''}
              >
                {/* @ts-ignore */}
                <Form.Item<T> {...itemProps}>{item.children}</Form.Item>
              </Col>
            )
          }
          )
          .filter((v) => !!v)}
      </Row>
    </Form>
  )
}
