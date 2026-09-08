def route_model(analysis):

    if analysis.needs_vision:
        return "vision_model"

    if analysis.task_type == "coding":
        return "coding_model"

    if analysis.complexity == "high":
        return "reasoning_model"

    return "general_model"