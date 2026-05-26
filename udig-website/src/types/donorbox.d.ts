import React from "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "dbox-widget": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            > & {
                campaign?: string;
                type?: string;
                "enable-auto-scroll"?: string;
            };
        }
    }
}

export {};