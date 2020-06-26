import React from 'react'
import commaNumber from 'comma-number'
import {OBJECT_ID} from '../file/Exporter'

const CUSTOM_LABEL = 'Upload custom tilegram'

export default class ImportControls extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedIndex: 0,
      usingUpload: false,
      uploadedFilename: '',
    }

    this._onFileUpload = this._onFileUpload.bind(this)
    this._resetUpload = this._resetUpload.bind(this)
  }

  /**
  * When new labels are passed, for example when a user selects a new geo,
  * reset selected index to match the loaded dataset
  */
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.labels) !== JSON.stringify(this.props.labels)) {
      this.setState({selectedIndex: 0})
    }
  }

  _onFileUpload(event) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = readEvent => {
      let topoJson
      try {
        topoJson = JSON.parse(readEvent.target.result)
        // validate is tilegram
        topoJson.objects[OBJECT_ID].geometries // eslint-disable-line no-unused-expressions
      } catch (e) {
        // catch non-json and non-tilegram topojson files
        // eslint-disable-next-line max-len, no-alert
        alert('We were unable to load your tilegram, sorry. If you\'re seeing this message it\'s probably because the tilegram format is incorrect or you tried to upload an unrecognized file type.')
        this._resetUpload()
        return
      }
      this.props.onCustomImport(topoJson)
      this.setState({
        usingUpload: true,
        uploadedFilename: file.name,
      })
    }
    reader.readAsText(file)
  }

  _resetUpload() {
    this.setState({
      selectedIndex: 0,
      usingUpload: false,
      uploadedFilename: '',
    })
    this.props.onTilegramSelected(0)
  }

  _onSelect(event) {
    const selectedIndex = event.target.value
    this.setState({selectedIndex})
    if (!this._isCustomSelection(selectedIndex)) {
      this.props.onTilegramSelected(selectedIndex)
    }
  }

  /** Return true if index is the 'Custom' option */
  _isCustomSelection(index) {
    return parseInt(index || this.state.selectedIndex, 10) === this.props.labels.length
  }

  _renderMenu() {
    const labels = this.props.labels.concat([CUSTOM_LABEL])
    const datasets = labels.map((label, index) => {
      return <option key={label} value={index}>{label}</option>
    })
    return (
      <select
        className='map-select'
        onChange={(event) => this._onSelect(event)}
      >
        {datasets}
      </select>
    )
  }

  render() {
    let importControls
    const resolution = (
      <fieldset>
        <span className='import-metric'>
          <span className='gray'>* </span>
          {commaNumber(this.props.metricPerTile)} per tile
        </span>
      </fieldset>
    )
    if (!this.state.usingUpload) {
      let customImportField
      if (this._isCustomSelection()) {
        customImportField = (
          <fieldset>
            <input
              className='import'
              type='file'
              onChange={this._onFileUpload}
            />
          </fieldset>
        )
      }
      importControls = (
        <div>
          <fieldset>
            {this._renderMenu()}
          </fieldset>
          {customImportField}
          {resolution}
        </div>
      )
    } else {
      importControls = (
        <div>
          <fieldset>
            <span>Using {this.state.uploadedFilename}</span>
            <a onClick={this._resetUpload}>&times;</a>
          </fieldset>
          {resolution}
        </div>
      )
    }
    return importControls
  }
}
ImportControls.propTypes = {
  labels: React.PropTypes.array,
  onTilegramSelected: React.PropTypes.func,
  onCustomImport: React.PropTypes.func,
  metricPerTile: React.PropTypes.number,
}
ImportControls.defaultProps = {
  labels: [],
  onTilegramSelected: () => {},
  onCustomImport: () => {},
  metricPerTile: 1,
}
