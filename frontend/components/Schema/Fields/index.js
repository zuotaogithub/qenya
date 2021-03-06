import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router-dom'
import { connect } from 'react-redux'
import { Button, Icon, Modal, Grid } from 'rctui'
import { shallowEqual } from 'rctui/utils/objects'
import { saveFields } from '_/actions/schemas'
import Field from './Field'
import RowList from './RowList'
import JsonImport from './JsonImport'

import _styles from '_/styles/app.scss'

class Fields extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      fields: props.schema.fields,
    }

    this.handleReset = this.handleReset.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.moveRow = this.moveRow.bind(this)
    this.exist = this.exist.bind(this)
    this.importJson = this.importJson.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.schema.fields !== nextProps.schema.fields) {
      this.setState({ fields: nextProps.schema.fields })
    }
  }

  moveRow(dragIndex, targetIndex) {
    const fields = [...this.state.fields]
    fields.splice(targetIndex, 0, fields.splice(dragIndex, 1)[0])
    this.setState({ fields })
  }

  handleSave() {
    const { dispatch, schema } = this.props
    dispatch(saveFields(schema._id, this.state.fields))
  }

  exist(index, name) {
    const item = this.state.fields.find((f, i) => i !== index && f.name === name)
    return !!item
  }

  handleEdit(index, field) {
    const mid = Modal.open({
      buttons: {
        确定: 'submit',
        取消: true,
      },
      padding: '2rem',
      width: '50rem',
      header: `${index < 0 ? '添加' : '编辑'}字段`,
      content: (
        <Field
          field={field}
          exist={this.exist}
          index={index}
          code={this.props.schema.code}
          schemas={this.props.schemas}
          onSubmit={(data) => {
            const fields = [...this.state.fields]
            index < 0 ? fields.push(data) : fields[index] = data
            this.setState({ fields })
            Modal.close(mid)
          }}
        />
      ),
    })
  }

  handleRemove(index) {
    const fields = this.state.fields.filter((f, i) => i !== index)
    this.setState({ fields })
  }

  handleReset() {
    this.setState({ fields: this.props.schema.fields })
  }

  importJson() {
    const mid = Modal.open({
      buttons: {
        确定: 'submit',
        取消: true,
      },
      padding: '2rem',
      width: '50rem',
      header: 'JSON',
      content: (
        <JsonImport
          onSuccess={(fields) => {
            this.setState({ fields })
            Modal.close(mid)
          }}
        />
      ),
    })
  }

  render() {
    const notChange = shallowEqual(this.state.fields, this.props.schema.fields)

    return (
      <div>
        <Prompt when={!notChange} message={'修改了部分字段但是没有保存，确定要离开吗？'} />

        <div className={_styles['tab-buttons']}>
          <Button status="success" onClick={this.handleEdit.bind(this, -1, undefined)}>
            <Icon icon="plus" />
            增加字段
          </Button>

          <Button onClick={this.importJson}>根据Json生成</Button>

          <Button disabled={notChange} onClick={this.handleSave} status="danger">
            <Icon icon="save" />
            保存修改
          </Button>

          <Button disabled={notChange} onClick={this.handleReset}>重置</Button>

          <span style={{ marginLeft: 12 }}>
            <Icon style={{ fontSize: '1.2rem', color: '#0275d8' }} icon="help" />
            增加/修改字段后需要点击保存修改，点击重置按钮会将字段恢复到最后一次保存状态
          </span>
        </div>

        <Grid className={`${_styles['row-list']} ${_styles['row-header']}`}>
          <Grid width={2 / 24} />
          <Grid width={4 / 24}>字段名</Grid>
          <Grid width={4 / 24}>别名</Grid>
          <Grid width={4 / 24}>类型</Grid>
          <Grid style={{ padding: '0.75rem 0', textAlign: 'center' }} width={2 / 24}>必填</Grid>
          <Grid style={{ padding: '0.75rem 0', textAlign: 'center' }} width={2 / 24}>唯一</Grid>
          <Grid>默认值</Grid>
        </Grid>

        <Grid className={_styles['row-list']}>
          <Grid width={2 / 24} />
          <Grid width={4 / 24}>_id</Grid>
          <Grid width={4 / 24}>ID</Grid>
          <Grid width={4 / 24}>id</Grid>
          <Grid width={10 / 24}>自动维护，不能修改</Grid>
        </Grid>

        <RowList
          fields={this.state.fields}
          moveRow={this.moveRow}
          onEdit={this.handleEdit}
          onRemove={this.handleRemove}
        />
      </div>
    )
  }
}

Fields.propTypes = {
  dispatch: PropTypes.func,
  schema: PropTypes.object.isRequired,
  schemas: PropTypes.array,
}

const mapStateToProps = (state) => {
  const { schemas } = state
  return { schemas: schemas.data }
}

export default connect(mapStateToProps)(Fields)
