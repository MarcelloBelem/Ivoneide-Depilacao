import React from "react";

const FloatingInput = React.forwardRef(
  ({ id, label, type = "text", error, ...rest }, ref) => {
    const lengthLimits = {
      text: { min: 3, max: 35 },
      password: { min: 5, max: 15 },
      email: { min: 5, max: 100 },
    };

    const { min, max } = lengthLimits[type];

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            id={id}
            type={type}
            ref={ref}
            {...rest}
            className={`peer ${error ? "border-red-500 focus:border-red-500" : "border-primary focus:border-primary"} block w-70 appearance-none rounded-lg border-1 bg-transparent px-2.5 pt-4 pb-2.5 text-base text-gray-900 focus:ring-0 focus:outline-none`}
            placeholder=" "
            maxLength={max}
            minLength={min}
          />
          <label
            htmlFor={id}
            className={`${error ? "text-red-500 peer-focus:text-red-500" : "text-primary peer-focus:text-primary"} absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4`}
          >
            {label}
          </label>
        </div>
        {error && <p className="ml-2 text-xs text-red-500">{error.message}</p>}
      </div>
    );
  },
);

export default FloatingInput;
