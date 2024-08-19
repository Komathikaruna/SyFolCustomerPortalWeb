/* eslint-disable */
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor'
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials'
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold'
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic'
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link'
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph'
import Image from '@ckeditor/ckeditor5-image/src/image'
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload'
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize'
import Heading from '@ckeditor/ckeditor5-heading/src/heading'
import UploadAdapterPlugin from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles'
import ImageResizeButtons from '@ckeditor/ckeditor5-image/src/imageresize/imageresizebuttons'
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar'
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting'
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle'
import Indent from '@ckeditor/ckeditor5-indent/src/indent'
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle'
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock'
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote'
import Table from '@ckeditor/ckeditor5-table/src/table'
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar'
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed'
import AutoformatPlugin from '@ckeditor/ckeditor5-autoformat/src/autoformat'
import Mention from '@ckeditor/ckeditor5-mention/src/mention'

export default class ClassicEditor extends ClassicEditorBase {}
ClassicEditor.builtinPlugins = [
  EssentialsPlugin,
  UploadAdapterPlugin,
  AutoformatPlugin,
  BoldPlugin,
  ParagraphPlugin,
  ItalicPlugin,
  Heading,
  Image,
  ImageUpload,
  ImageResize,
  ImageResizeEditing,
  ImageResizeHandles,
  ImageToolbar,
  ImageResizeButtons,
  ImageStyle,
  Indent,
  IndentBlock,
  LinkPlugin,
  ListStyle,
  BlockQuote,
  Table,
  TableToolbar,
  MediaEmbed,
  Mention,
  MentionCustomization,
  ConvertIFrameAttributes,
  ConvertDivAttributes,
  ConvertImageAttributes
]
ClassicEditor.defaultConfig = {
  removePlugins: ['htmldataprocessor'],
  table: {
    contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
  },
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList', 'numberedList', '|',
      'outdent', 'indent', '|',
      'undo',
      'redo',
      'imageUpload',
      'blockQuote', '|',
      'insertTable',
      'mediaEmbed'
    ]
  },
  image: {
    styles: [
      'alignLeft', 'alignCenter', 'alignRight'
    ],
    // Configure the available image resize options.
    resizeOptions: [
      {
        name: 'resizeImage:original',
        label: 'Original',
        value: null
      }, {
        name: 'resizeImage:50',
        label: '50%',
        value: '50'
      }, {
        name: 'resizeImage:75',
        label: '75%',
        value: '75'
      }
    ],
    toolbar: [
      'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
      '|',
      'resizeImage',
      '|',
      'imageTextAlternative'
    ]
  },
  indentBlock: {
    offset: 1,
    unit: 'em'
  },
  language: 'en',
  allowedContent: 'iframe[*]'
}
function MentionCustomization (editor) {
  // The upcast converter will convert <a class="mention" href="" data-user-id="">
  // elements to the model 'mention' attribute.
  editor.conversion.for('upcast').elementToAttribute({
    view: {
      name: 'span',
      key: 'data-mention',
      classes: 'mention',
      attributes: {
        'data-user-id': true,
        'data-user-email': true
      }
    },
    model: {
      key: 'mention',
      value: viewItem => {
        // The mention feature expects that the mention attribute value
        // in the model is a plain object with a set of additional attributes.
        // In order to create a proper object, use the toMentionAttribute helper method:
        return  editor.plugins.get('Mention').toMentionAttribute(viewItem, {
          // Add any other properties that you need.
          userId: viewItem.getAttribute('data-user-id'),
          email: viewItem.getAttribute('data-user-email')
        })
      }
    },
    converterPriority: 'high'
  })
  // Downcast the model 'mention' text attribute to a view <a> element.
  editor.conversion.for('downcast').attributeToElement({
    model: 'mention',
    view: (modelAttributeValue, { writer }) => {
      // Do not convert empty attributes (lack of value means no mention).
      if (!modelAttributeValue) {
        return
      }
      return writer.createAttributeElement('span', {
        class: 'mention',
        'data-mention': modelAttributeValue.id,
        'data-user-id': modelAttributeValue.userId,
        'data-user-email': modelAttributeValue.email
      }, {
        // Make mention attribute to be wrapped by other attribute elements.
        priority: 20,
        // Prevent merging mentions together.
        id: modelAttributeValue.uid
      })
    },
    converterPriority: 'high'
  })
}
function ConvertDivAttributes (editor) {
  // Allow <div> elements in the model.
  editor.model.schema.register( 'div', {
    allowWhere: '$block',
    allowContentOf: '$root'
} );

// Allow <div> elements in the model to have all attributes.
editor.model.schema.addAttributeCheck( context => {
    if ( context.endsWith( 'div' ) ) {
        return true;
    }
} );

// The view-to-model converter converting a view <div> with all its attributes to the model.
editor.conversion.for( 'upcast' ).elementToElement( {
    view: 'div',
    model: ( viewElement, { writer: modelWriter } ) => {
        return modelWriter.createElement( 'div', viewElement.getAttributes() );
    }
} );

// The model-to-view converter for the <div> element (attributes are converted separately).
editor.conversion.for( 'downcast' ).elementToElement( {
    model: 'div',
    view: 'div'
} );

// The model-to-view converter for <div> attributes.
// Note that a lower-level, event-based API is used here.
editor.conversion.for( 'downcast' ).add( dispatcher => {
    dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
        // Convert <div> attributes only.
        if ( data.item.name != 'div' ) {
            return;
        }

        const viewWriter = conversionApi.writer;
        const viewDiv = conversionApi.mapper.toViewElement( data.item );

        // In the model-to-view conversion we convert changes.
        // An attribute can be added or removed or changed.
        // The below code handles all 3 cases.
        if ( data.attributeNewValue ) {
            viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
        } else {
            viewWriter.removeAttribute( data.attributeKey, viewDiv );
        }
    } );
} );
}
function ConvertImageAttributes( editor ) {
  // Allow <div> elements in the model.
  editor.model.schema.register( 'img', {
      allowWhere: '$block',
      allowContentOf: '$root'
  } );

  // Allow <div> elements in the model to have all attributes.
  editor.model.schema.addAttributeCheck( context => {
      if ( context.endsWith( 'img' ) ) {
          return true;
      }
  } );

  // The view-to-model converter converting a view <div> with all its attributes to the model.
  editor.conversion.for( 'upcast' ).elementToElement( {
      view: 'img',
      model: ( viewElement, { writer: modelWriter } ) => {
          return modelWriter.createElement( 'img', viewElement.getAttributes() );
      }
  } );

  // The model-to-view converter for the <div> element (attributes are converted separately).
  editor.conversion.for( 'downcast' ).elementToElement( {
      model: 'img',
      view: 'img'
  } );

  // The model-to-view converter for <div> attributes.
  // Note that a lower-level, event-based API is used here.
  editor.conversion.for( 'downcast' ).add( dispatcher => {
      dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
          // Convert <div> attributes only.
          if ( data.item.name != 'img' ) {
              return;
          }

          const viewWriter = conversionApi.writer;
          const viewDiv = conversionApi.mapper.toViewElement( data.item );

          // In the model-to-view conversion we convert changes.
          // An attribute can be added or removed or changed.
          // The below code handles all 3 cases.
          if ( data.attributeNewValue ) {
              viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
          } else {
              viewWriter.removeAttribute( data.attributeKey, viewDiv );
          }
      } );
  } );
}
function ConvertIFrameAttributes( editor ) {
  // Allow <div> elements in the model.
  editor.model.schema.register( 'iframe', {
      allowWhere: '$block',
      allowContentOf: '$root'
  } );

  // Allow <div> elements in the model to have all attributes.
  editor.model.schema.addAttributeCheck( context => {
      if ( context.endsWith( 'iframe' ) ) {
          return true;
      }
  } );

  // The view-to-model converter converting a view <div> with all its attributes to the model.
  editor.conversion.for( 'upcast' ).elementToElement( {
      view: 'iframe',
      model: ( viewElement, { writer: modelWriter } ) => {
          return modelWriter.createElement( 'iframe', viewElement.getAttributes() );
      }
  } );

  // The model-to-view converter for the <div> element (attributes are converted separately).
  editor.conversion.for( 'downcast' ).elementToElement( {
      model: 'iframe',
      view: 'iframe'
  } );

  // The model-to-view converter for <div> attributes.
  // Note that a lower-level, event-based API is used here.
  editor.conversion.for( 'downcast' ).add( dispatcher => {
      dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
          // Convert <div> attributes only.
          if ( data.item.name != 'iframe' ) {
              return;
          }

          const viewWriter = conversionApi.writer;
          const viewDiv = conversionApi.mapper.toViewElement( data.item );

          // In the model-to-view conversion we convert changes.
          // An attribute can be added or removed or changed.
          // The below code handles all 3 cases.
          if ( data.attributeNewValue ) {
              viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, viewDiv );
          } else {
              viewWriter.removeAttribute( data.attributeKey, viewDiv );
          }
      } );
  } );
}