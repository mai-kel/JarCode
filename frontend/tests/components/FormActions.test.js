import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FormActions from '../../src/components/FormActions.vue';

describe('FormActions', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(FormActions, {
      props: {
        isDirty: false,
        isLoading: false,
        ...props
      }
    });
  };

  beforeEach(() => {
    wrapper = null;
  });

  it('should render save button', () => {
    wrapper = createWrapper();
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.exists()).toBe(true);
    expect(saveButton.text()).toBe('Save');
  });

  it('should disable save button when not dirty', () => {
    wrapper = createWrapper({ isDirty: false });
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeDefined();
  });

  it('should enable save button when dirty', () => {
    wrapper = createWrapper({ isDirty: true });
    const saveButton = wrapper.find('button[type="submit"]');
    expect(saveButton.attributes('disabled')).toBeUndefined();
  });

  it('should show loading state on save button', () => {
    wrapper = createWrapper({ isLoading: true });
    expect(wrapper.props('isLoading')).toBe(true);
  });

  it('should not show delete button by default', () => {
    wrapper = createWrapper();
    const deleteButton = wrapper.find('button.p-button-danger');
    expect(deleteButton.exists()).toBe(false);
  });

  it('should show delete button when showDelete is true', () => {
    wrapper = createWrapper({ showDelete: true });
    const deleteButton = wrapper.find('button.p-button-danger');
    expect(deleteButton.exists()).toBe(true);
    expect(deleteButton.text()).toBe('Delete');
  });

  it('should emit save event on save button click', async () => {
    wrapper = createWrapper({ isDirty: true });
    const saveButton = wrapper.find('button[type="submit"]');
    await saveButton.trigger('click');
    expect(wrapper.emitted('save')).toBeTruthy();
  });

  it('should emit delete event on delete button click', async () => {
    wrapper = createWrapper({ showDelete: true });
    const deleteButton = wrapper.find('button.p-button-danger');
    await deleteButton.trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
  });

  it('should use custom labels', () => {
    wrapper = createWrapper({
      saveLabel: 'Update',
      deleteLabel: 'Remove',
      showDelete: true
    });
    expect(wrapper.find('button[type="submit"]').text()).toBe('Update');
    expect(wrapper.find('button.p-button-danger').text()).toBe('Remove');
  });
});

