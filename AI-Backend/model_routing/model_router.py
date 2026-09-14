def route_model(analysis):
    if isinstance(analysis, dict):
        needs_vision = analysis.get("needs_vision")
        task_type = analysis.get("task_type")
        complexity = analysis.get("complexity")
    else:
        needs_vision = analysis.needs_vision
        task_type = analysis.task_type
        complexity = analysis.complexity

    if needs_vision:
        return "vision_model"

    if task_type == "coding":
        return "coding_model"

    if complexity == "high":
        return "reasoning_model"

    return "general_model"