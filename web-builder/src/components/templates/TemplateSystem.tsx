import React from 'react';
import { Template } from '@/store/builderStore';
import { Container } from './core/Container';
import { Header } from './core/Header';
import { Footer } from './core/Footer';
import { Hero } from './core/Hero';
import { TextSection } from './core/TextSection';
import { Form } from './core/Form';
import { Grid } from './core/Grid';
import { Card } from './core/Card';
import { Navigation } from './core/Navigation';
import { Button } from './core/Button';

interface TemplateSystemProps {
  template: Template;
  className?: string;
}

export const TemplateSystem: React.FC<TemplateSystemProps> = ({ template, className = '' }) => {
  const renderComponent = (component: any) => {
    const commonProps = {
      key: component.id,
      id: component.id,
      styles: component.styles || {},
      props: component.props || {},
      className: component.className || '',
    };

    switch (component.type) {
      case 'container':
        return (
          <Container {...commonProps}>
            {component.children?.map((childId: string) => {
              const child = template.components.find((c: any) => c.id === childId);
              return child ? renderComponent(child) : null;
            })}
          </Container>
        );
      
      case 'navigation':
        return <Navigation {...commonProps} />;
      
      case 'header':
        return <Header {...commonProps} />;
      
      case 'footer':
        return <Footer {...commonProps} />;
      
      case 'hero':
        return <Hero {...commonProps} />;
      
      case 'text':
        return <TextSection {...commonProps} content={component.content} />;
      
      case 'form':
        return <Form {...commonProps} />;
      
      case 'grid':
        return (
          <Grid {...commonProps}>
            {component.children?.map((childId: string) => {
              const child = template.components.find((c: any) => c.id === childId);
              return child ? renderComponent(child) : null;
            })}
          </Grid>
        );
      
      case 'card':
        return <Card {...commonProps} content={component.content} />;
      
      case 'button':
        return <Button {...commonProps} content={component.content} />;
      
      default:
        return (
          <div key={component.id} style={component.styles || {}}>
            {component.content}
          </div>
        );
    }
  };

  const rootComponents = template.components.filter((c: any) => !c.parentId);

  return (
    <div className={`template-system ${className}`}>
      {rootComponents.map((component: any) => renderComponent(component))}
    </div>
  );
};