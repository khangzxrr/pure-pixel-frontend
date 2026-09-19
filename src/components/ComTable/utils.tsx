import {
  useState,
  useRef,
  type ChangeEvent,
  type Key,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Input, Space, Button, DatePicker, type InputRef } from "antd";
import type { ColumnType, FilterDropdownProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import moment, { type MomentInput } from "moment";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// a filter key; the range filters store [start, end] / [min, max] as one key and antd keeps it as is
export type FilterKey = Key | string[];

// method syntax: antd's FilterDropdownProps (plain keys) stays assignable to this wider shape
interface RangeFilterDropdownProps
  extends Omit<FilterDropdownProps, "selectedKeys" | "setSelectedKeys"> {
  selectedKeys: FilterKey[];
  setSelectedKeys(selectedKeys: FilterKey[]): void;
}

// `source && source[key]`, primitives included
const readProperty = (source: unknown, key: string): unknown =>
  source ? Reflect.get(Object(source), key) : source;

// moment takes objects, strings, numbers and undefined as they are; other values as text
const toMomentInput = (value: unknown): MomentInput =>
  typeof value === "object" ||
  typeof value === "string" ||
  typeof value === "number" ||
  value === undefined
    ? value
    : String(value);

// values React renders directly; anything else is shown as text
const isRenderable = (
  value: unknown,
): value is string | number | boolean | null | undefined =>
  value === null ||
  ["string", "number", "boolean", "undefined"].includes(typeof value);

const useColumnFilters = () => {
  const [searchText, setSearchText] = useState<
    FilterKey | FilterKey[] | undefined
  >("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: FilterKey[],
    confirm: () => void,
    dataIndex: string,
  ) => {
    confirm();
    if (dataIndex === "createdAt") {
      setSearchText(selectedKeys);
    } else {
      setSearchText(selectedKeys[0]);
    }
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // reads "a.b.c" paths
  const getNestedValue = (obj: unknown, path: string) => {
    return path
      .split(".")
      .reduce<unknown>((acc, part) => readProperty(acc, part), obj);
  };

  const getColumnSearchProps = <T extends object = object>(
    dataIndex: string,
    title: string,
  ): ColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${title}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="dashed"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            <div className="justify-center flex ">
              <SearchOutlined />
              Tìm kiếm
            </div>
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#de1818" : "#fff" }} />
    ),
    onFilter: (value, record) => {
      const nestedValue = getNestedValue(record, dataIndex);
      return nestedValue
        ? String(nestedValue)
            .toLowerCase()
            .includes(value.toString().toLowerCase())
        : false;
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (_text: unknown, record) => {
      const nestedValue = getNestedValue(record, dataIndex);
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#001aff", padding: 0 }}
          searchWords={typeof searchText === "string" ? [searchText] : []}
          autoEscape
          textToHighlight={nestedValue ? String(nestedValue) : ""}
        />
      ) : isRenderable(nestedValue) ? (
        nestedValue
      ) : (
        String(nestedValue)
      );
    },
  });

  const toRangeKey = (dates: ReadonlyArray<dayjs.Dayjs | null> | null) =>
    dates
      ? [
          dates.map((date) =>
            date ? date.startOf("day").toISOString() : "",
          ),
        ]
      : [];

  const getColumnApprox = <T extends object = object>(
    dataIndex: string,
    _title?: string,
  ): ColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      close,
    }: RangeFilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <RangePicker
          onChange={(dates) => {
            setSelectedKeys(toRangeKey(dates));
          }}
          style={{ marginBottom: 8, display: "block" }}
          format="DD-MM-YYYY"
        />
        <Space>
          <Button
            type="dashed"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            <div className="justify-center flex">
              <SearchOutlined />
              Tìm kiếm
            </div>
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#001aff" : "#fff" }} />
    ),
    onFilter: (value: FilterKey | boolean, record) => {
      if (!Array.isArray(value) || !value.length) return true;
      const recordDate = moment(
        toMomentInput(getNestedValue(record, dataIndex)),
      ).startOf("day");
      const [start, end] = value;
      return (
        recordDate.isSameOrAfter(moment(start)) &&
        recordDate.isSameOrBefore(moment(end))
      );
    },
    render: (_text: unknown, record) => {
      const nestedValue = getNestedValue(record, dataIndex);
      return moment(toMomentInput(nestedValue)).format("DD-MM-YYYY");
    },
  });

  const getColumnApprox1 = <T extends object = object>(
    dataIndex: string,
    _title?: string,
  ): ColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      close,
    }: RangeFilterDropdownProps) => {
      const range = selectedKeys[0];
      return (
        <div style={{ padding: 8 }}>
          <RangePicker
            value={
              Array.isArray(range) ? [dayjs(range[0]), dayjs(range[1])] : null
            }
            onChange={(dates) => {
              setSelectedKeys(toRangeKey(dates));
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="dashed"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              <div className="justify-center flex">
                <SearchOutlined />
                Tìm kiếm
              </div>
            </Button>

            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              Đóng
            </Button>
          </div>
        </div>
      );
    },
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#001aff" : "#fff" }} />
    ),
    onFilter: (value: FilterKey | boolean, record) => {
      if (!Array.isArray(value) || !value.length) return true;
      const recordDate = moment(
        toMomentInput(readProperty(record, dataIndex)),
      ).startOf("day");
      const [start, end] = value;
      return (
        recordDate.isSameOrAfter(moment(start)) &&
        recordDate.isSameOrBefore(moment(end))
      );
    },
  });

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.which ? e.which : e.keyCode;
    const char = String.fromCharCode(charCode);
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value: string) => {
    return value.replace(/,/g, "");
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setSelectedKeys: (selectedKeys: FilterKey[]) => void,
    index: number,
    selectedKeys: FilterKey[],
  ) => {
    const value = e.target.value;
    const parsedValue = parseNumber(value);
    if (!isNaN(Number(parsedValue))) {
      const range = selectedKeys[0];
      const newValues = [...(Array.isArray(range) ? range : ["", ""])];
      newValues[index] = parsedValue;
      setSelectedKeys([newValues]);
    }
  };

  const getColumnPriceRangeProps = <T extends object = object>(
    dataIndex: string,
    _title?: string,
  ): ColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: RangeFilterDropdownProps) => {
      const range = selectedKeys[0];
      return (
        <div style={{ padding: 8 }}>
          <Input.Group compact>
            <Input
              style={{ width: 100, textAlign: "center" }}
              placeholder="Tối thiểu"
              value={Array.isArray(range) ? formatNumber(range[0]) : ""}
              onChange={(e) =>
                handleInputChange(e, setSelectedKeys, 0, selectedKeys)
              }
              onKeyPress={handleKeyPress}
            />
            <Input
              style={{
                width: 30,
                borderLeft: 0,
                pointerEvents: "none",
                backgroundColor: "#fff",
              }}
              placeholder="~"
              disabled
            />
            <Input
              style={{ width: 100, textAlign: "center", borderLeft: 0 }}
              placeholder="Tối đa"
              value={Array.isArray(range) ? formatNumber(range[1]) : ""}
              onChange={(e) =>
                handleInputChange(e, setSelectedKeys, 1, selectedKeys)
              }
              onKeyPress={handleKeyPress}
            />
          </Input.Group>
          <Space style={{ marginTop: 8 }}>
            <Button
              type="dashed"
              onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
              size="small"
              style={{ width: 90 }}
            >
              <div className="justify-center flex">
                <SearchOutlined />
                Tìm kiếm
              </div>
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              Đóng
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#001aff" : "#fff" }} />
    ),
    onFilter: (value: FilterKey | boolean, record) => {
      if (!Array.isArray(value) || !value.length) return true;
      // relational comparison converts the record value to a number the same way
      const recordPrice = Number(readProperty(record, dataIndex));
      const [min, max] = value.map(parseNumber);
      return (
        (min ? recordPrice >= parseFloat(min) : true) &&
        (max ? recordPrice <= parseFloat(max) : true)
      );
    },
    render: (text: string | number) => formatNumber(text.toString()),
  });
  const getUniqueValues = <T,>(data: T[], key: string) => {
    const uniqueValues = new Set<unknown>();
    data.forEach((item) => {
      const value = key
        .split(".")
        .reduce<unknown>((acc, part) => readProperty(acc, part), item);
      if (value) uniqueValues.add(value);
    });
    return [...uniqueValues];
  };
  const getColumnFilterProps = <T extends object = object>(
    dataIndex: string,
    _title: string,
    uniqueValues: Array<string | number | boolean>,
  ): ColumnType<T> => ({
    filters: uniqueValues.map((value) => ({ text: value, value })),
    onFilter: (value, record) => getNestedValue(record, dataIndex) === value,
    render: (text: ReactNode) => text,
  });

  return {
    getColumnSearchProps,
    getColumnApprox,
    searchText,
    searchedColumn,
    handleSearch,
    handleReset,
    getColumnApprox1,
    getColumnPriceRangeProps,
    getColumnFilterProps,
    getUniqueValues,
  };
};

export default useColumnFilters;
