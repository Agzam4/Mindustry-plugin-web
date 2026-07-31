import { useState, useEffect, useMemo } from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import clsx from 'clsx';
import style from './AuthorsSelect.module.scss';
import Player from '@/components/ui/text/Player';

interface AuthorsSelectProps {
    authors: number[];
    onChange: (authors: number[]) => void;
    apiSearchFn: (inputValue: string) => Promise<number[]>;
}

export default function AuthorsSelect({
    authors,
    onChange,
    apiSearchFn,
}: AuthorsSelectProps) {
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        selectedItems,
    } = useMultipleSelection({
        selectedItems: authors,
        onStateChange({ selectedItems: newSelectedItems, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
                    if (newSelectedItems) onChange(newSelectedItems);
                    break;
                default:
                    break;
            }
        },
    });

    const filteredItems = useMemo(() => {
        return items.filter(
            (item) => !selectedItems.some((selected) => selected === item)
        );
    }, [items, selectedItems]);

    useEffect(() => {
        if (inputValue.trim().length < 2) {
            setItems([]);
            return;
        }

        let isCurrent = true;
        setLoading(true);

        const delayDebounce = setTimeout(async () => {
            try {
                const response = await apiSearchFn(inputValue);
                if (isCurrent) {
                    setItems(response);
                }
            } catch (err) {
                console.error(err);
                if (isCurrent) setItems([]);
            } finally {
                if (isCurrent) setLoading(false);
            }
        }, 300);

        return () => {
            isCurrent = false;
            clearTimeout(delayDebounce);
        };
    }, [inputValue, apiSearchFn]);

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
    } = useCombobox({
        items: filteredItems,
        itemToString(item) {
            return item ? String(item) : '';
        },
        defaultHighlightedIndex: 0,
        selectedItem: null,
        inputValue,
        stateReducer(state, actionAndChanges) {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true,
                        highlightedIndex: 0,
                    };
                default:
                    return changes;
            }
        },
        onStateChange({ inputValue: newInputValue, type, selectedItem: newSelectedItem }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.InputBlur:
                    if (newSelectedItem) {
                        onChange([...selectedItems, newSelectedItem]);
                        setInputValue('');
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange:
                    setInputValue(newInputValue || '');
                    break;
                default:
                    break;
            }
        },
    });

    const hasMinChars = inputValue.trim().length >= 2;

    return (
        <div className={style.selectWrapper}>
            <div className={style.container}>
                {selectedItems.map((selectedItem, index) => (
                    <span className={style.tag} key={`selected-item-${index}`} {...getSelectedItemProps({ selectedItem, index })}>
                        <Player id={selectedItem} />
                        <button className={clsx("no-button", style.removeTag)} onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedItem(selectedItem);
                        }}>✕</button>
                    </span>
                ))}

                <div className={style.inputContainer}>
                    <input
                        placeholder="Enter player"
                        className={clsx("no-button", style.input)}
                        {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
                    />
                </div>
            </div>

            <ul className={clsx(style.dropdown, !(isOpen) && style.hidden)} {...getMenuProps()}>
                {isOpen && (
                    <>
                        {loading && <li className={style.messageOption}>loading...</li>}

                        {!loading && !hasMinChars && (
                            <li className={style.messageOption}>Enter player...</li>
                        )}

                        {!loading && hasMinChars && filteredItems.length === 0 && (
                            <li className={style.messageOption}>Not found</li>
                        )}

                        {!loading && filteredItems.map((item, index) => (
                            <li
                                className={clsx(style.item, highlightedIndex === index && style.menuItemHighlighted)}
                                key={`${item}-${index}`}
                                {...getItemProps({ item, index })}
                            >
                                <Player id={item} />
                            </li>
                        ))}
                    </>
                )}
            </ul>
        </div >
    );
}
