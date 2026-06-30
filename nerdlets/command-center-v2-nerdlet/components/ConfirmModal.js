import React from 'react';
import PropTypes from 'prop-types';
import { Button, HeadingText, Modal } from 'nr1';

export default function ConfirmModal({
  hidden,
  heading,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
}) {
  return (
    <Modal hidden={hidden} onClose={onCancel}>
      <HeadingText>
        <strong>{heading}</strong>
      </HeadingText>
      <Button
        type={Button.TYPE.PRIMARY}
        className="modalBtn"
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
      <Button
        type={Button.TYPE.DESTRUCTIVE}
        className="modalBtn"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  hidden: PropTypes.bool.isRequired,
  heading: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
};

ConfirmModal.defaultProps = {
  confirmLabel: 'Yes',
  cancelLabel: 'No',
};
