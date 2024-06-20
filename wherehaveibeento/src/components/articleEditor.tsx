import { Plate } from '@udecode/plate-common';
import { Editor } from './plate-ui/editor';

export function ArticleEditor(props: { onChangeCallback?: (newValue: any) => void}) {

  return (
    <Plate 
        onChange={(newValue) => {
            if (props.onChangeCallback) {
                props.onChangeCallback(newValue);
            }
        }}>
      <Editor placeholder="Type..." />
    </Plate>
  );
}
