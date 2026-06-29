import React from 'react';
import PropTypes from 'prop-types';
import { Button, HeadingText, Modal, TextField } from 'nr1';

export default function LinkModal({
  hidden,
  displayText,
  linkText,
  onChangeDisplay,
  onChangeLink,
  onSave,
  onClose,
}) {
  return (
    <Modal hidden={hidden} onClose={onClose}>
      <HeadingText>
        <strong>Edit Link</strong>
      </HeadingText>
      <TextField
        style={{ marginRight: '2px' }}
        value={displayText || ''}
        onChange={(e) => onChangeDisplay(e.target.value)}
        label="Text to Display"
      />
      <TextField
        value={linkText || ''}
        onChange={(e) => onChangeLink(e.target.value)}
        label="Link To"
      />
      <br />
      <Button type={Button.TYPE.PRIMARY} className="modalBtn" onClick={onSave}>
        Save
      </Button>
      <Button
        type={Button.TYPE.DESTRUCTIVE}
        className="modalBtn"
        onClick={onClose}
      >
        Close
      </Button>
    </Modal>
  );
}

LinkModal.propTypes = {
  hidden: PropTypes.bool.isRequired,
  displayText: PropTypes.string,
  linkText: PropTypes.string,
  onChangeDisplay: PropTypes.func.isRequired,
  onChangeLink: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
