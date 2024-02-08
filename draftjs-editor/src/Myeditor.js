import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

const styleMap = {
  'BOLD': {
    fontWeight: 'bold',
  },
  'RED_COLOR': {
    color: 'red',
  },
  'UNDERLINE': {
    textDecoration: 'underline',
  },
};

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const storedState = localStorage.getItem('editorContent');
    if (storedState) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(storedState)));
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    saveContentToLocalStorage(contentState);
  }, [editorState]);

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      return 'not-handled';
    }

    const currentContent = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const currentBlock = currentContent.getBlockForKey(startKey);
    const blockText = currentBlock.getText();

    if (chars === ' ') {
      let newState = null;
      switch (blockText) {
        case '#':
          newState = RichUtils.toggleBlockType(editorState, 'header-one');
          break;
        case '*':
          newState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
          break;
        case '**':
          newState = applyCustomStyle(editorState, 'RED_COLOR');
          break;
        case '***':
          newState = applyCustomStyle(editorState, 'UNDERLINE');
          break;
        default:
          break;
      }

      if (newState) {
        setEditorState(newState);
        return 'handled';
      }
    }

    return 'not-handled';
  };

  const applyCustomStyle = (editorState, style) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const newContentState = Modifier.applyInlineStyle(
      currentContent,
      selection.merge({
        anchorOffset: 0,
        focusOffset: selection.getStartOffset(),
      }),
      style
    );
    return EditorState.push(editorState, newContentState, 'change-inline-style');
  };

  const saveContentToLocalStorage = (contentState) => {
    const content = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', content);
  };

  return (
    <div style={{ margin: '20px auto', maxWidth: '800px', border: '1px solid #ccc', position: 'relative', minHeight: '400px' }}>
      <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>My Editor</h2>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
        />
      </div>
      <button 
        onClick={() => saveContentToLocalStorage(editorState.getCurrentContent())}
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px',
          zIndex: 1,
        }}>
        Save
      </button>
    </div>
  );
};

export default MyEditor;
