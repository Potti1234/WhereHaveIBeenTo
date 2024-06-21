import { Plate } from '@udecode/plate-common';
import { Editor } from './plate-ui/editor';

export function ArticleEditor(props: { onChangeCallback?: ((newValue: any) => void) | null , initialValue: any, readOnly: boolean}) {

  return (
    <Plate 
        initialValue={props.initialValue}
        readOnly={props.readOnly}
        onChange={(newValue) => {
            if (props.onChangeCallback) {
                props.onChangeCallback(newValue);
            }
        }}>
      <Editor placeholder="Type..." />
    </Plate>
  );
}
