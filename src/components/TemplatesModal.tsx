import React from 'react';
import { TemplateGallery, TemplateGalleryProps } from './TemplateGallery';

export type TemplatesModalProps = TemplateGalleryProps;

export const TemplatesModal: React.FC<TemplatesModalProps> = (props) => {
  return <TemplateGallery {...props} />;
};
