﻿public class Result
{
    public bool IsSuccess { get; set; } = true;
    public string Message { get; set; }
    public object Data { get; set; }
}

public class Result<T>
{
    public bool IsSuccess { get; set; } = true;
    public string Message { get; set; }
    public T Data { get; set; }
}