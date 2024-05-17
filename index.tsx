import React, { PropsWithChildren, forwardRef, useImperativeHandle, useState } from 'react'
import { forwardrefHOC } from 'react-foundations-utils'
import { Button, ColProps, Form, FormInstance, FormProps, Modal, ModalProps } from 'antd'
import HangarForm, { HandleFormItemType } from './handleForm'
import styles from './index.less'

export type FormModalProps<
  T extends Record<string, any>,
  K extends string
> = PropsWithChildren &
  FormProps & {
    actionType: 'add' | 'edit' | 'preview'
    formValues?: T
    modalProps?: ModalProps
    dictionary: Record<K, string>
    items?: HandleFormItemType<keyof T>[]
    span?: ColProps['span']
    onSubmit: (vlaues: T) => any
    renderForm?: (hangarForm: React.ReactElement) => React.ReactNode
  }

// 操作类型文本
export const ActTypeTextMap = {
  add: '新增',
  edit: '编辑',
  preview: '查看',
}

export type FormModalRef = {
  form: FormInstance
  setOpen: (open: boolean) => void
}

function FormModal<
  T extends Record<string, any>,
  K extends string
>({
  children,
  actionType,
  formValues,
  dictionary,
  items,
  modalProps,
  span,
  onSubmit,
  onError,
  renderForm,
  ...formProps
}: FormModalProps<T, K>, ref: React.Ref<FormModalRef>) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()



  const handleClickBtn = () => {
    setOpen(true)
  }

  const handleOk = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
   await form
      .validateFields()
      .then(async (values) => {
        await onSubmit(values)
        form.resetFields()
        setOpen(false)
      })
      .catch((error) => {
        onError?.(error)
      })
    modalProps?.onOk?.(e)
  }
    

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setOpen(false)
    modalProps?.onCancel?.(e)
  }

  useImperativeHandle(ref, () => ({
    form,
    setOpen,
  }), [form])

  const handleForm = (
    <HangarForm<T, K>
      actionType={actionType}
      values={formValues}
      items={items}
      dictionary={dictionary}
      form={form}
      span={span}
      {...formProps}
    />
  )

  return (
    <>
      {React.isValidElement(children) ? (
        React.cloneElement(children, {
          ...children?.props,
          onClick: (...args: any) => {
            handleClickBtn()
            return children?.props?.onClick?.(...args)
          },
        })
      ) : (
        <Button type="primary" onClick={handleClickBtn}>
          {children}
        </Button>
      )}

      <Modal
        open={open}
        title={modalProps?.title ?? `${ActTypeTextMap[actionType]}`}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        maskClosable={false}
        width={600}
        {...modalProps}
        onCancel={handleCancel}
        onOk={handleOk}
        className={`${styles.modal} ${modalProps?.className || ''}`}
      >
        {renderForm ? renderForm(handleForm) : handleForm}
      </Modal>
    </>
  )
}

export default forwardrefHOC(FormModal)