import { type PlanProperties } from "@/core/plan/type"

function add(obj: PlanProperties) {
    set(obj)
}

function set(obj: PlanProperties) {

}

function del(obj: PlanProperties | string) {
    if (typeof (obj) === "string") {

    }
    else {

    }
}

export {
    add,
    set,
    del
}